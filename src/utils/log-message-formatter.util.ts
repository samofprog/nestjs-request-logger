/**
 * @file Log Message Formatter
 * @description Formats log messages in structured key=value format
 * @author samofprog
 * @license MIT
 */

import {
    CompletedRequestDetails,
    MessageFormatters,
    RequestDetails,
} from '../types';
import { HeaderFieldExtractor } from './header-field-extractor.util';
import { HeaderSanitizer } from './header-sanitizer.util';

/**
 * Structured log message formatter.
 *
 * Formats log messages in key=value format with camelCase keys and descriptive prefixes:
 * - Incoming: `Incoming request: method=GET path=/api/users`
 * - Completed: `Request completed: method=GET path=/api/users statusCode=200 durationMs=45ms`
 *
 * Supports:
 * - Custom header field extraction
 * - Automatic header sanitization
 * - Request body logging
 *
 * @class LogMessageFormatter
 *
 * @example
 * ```typescript
 * import { LogMessageFormatter } from '@samofprog/nestjs-request-logger/formatters';
 *
 * const formatter = new LogMessageFormatter({
 *   headerFields: ['content-type', 'x-request-id'],
 *   logRequestBody: true,
 *   sensitiveHeaders: ['authorization', 'x-api-key']
 * });
 *
 * const incoming = formatter.incoming({
 *   method: 'GET',
 *   path: '/api/users',
 *   headers: { 'content-type': 'application/json' },
 * });
 * // Result: "Incoming request: method=GET path=/api/users content-type=application/json"
 * ```
 */
export class LogMessageFormatter implements MessageFormatters {
    private readonly headerFieldExtractor: HeaderFieldExtractor;
    private readonly headerSanitizer: HeaderSanitizer;
    private readonly logRequestBody: boolean;

    /**
     * Create a new LogMessageFormatter instance
     *
     * @param {Object} options - Formatter options
     * @param {string[]} [options.headerFields=[]] - Header fields to extract
     * @param {boolean} [options.logRequestBody=false] - Whether to log request body
     * @param {string[]} [options.sensitiveHeaders] - Custom list of sensitive headers
     */
    constructor(
        options: {
            headerFields?: string[];
            logRequestBody?: boolean;
            sensitiveHeaders?: string[];
        } = {}
    ) {
        this.headerFieldExtractor = new HeaderFieldExtractor(
            options.headerFields ?? []
        );
        this.headerSanitizer = new HeaderSanitizer(options.sensitiveHeaders);
        this.logRequestBody = options.logRequestBody ?? false;
    }

    /**
     * Format incoming request in structured key=value format
     *
     * @param {RequestDetails} details - Request details
     * @returns {string} Formatted log message
     */
    incoming = (details: RequestDetails): string => {
        const sanitizedHeaders = this.headerSanitizer.sanitize(details.headers);
        const headerFields =
            this.headerFieldExtractor.extract(sanitizedHeaders);

        let message = `Incoming request: method=${details.method} path=${details.path}${headerFields}`;

        if (this.logRequestBody && details.body) {
            message += ` body=${JSON.stringify(details.body)}`;
        }

        return message;
    };

    /**
     * Format completed request in structured key=value format
     *
     * @param {CompletedRequestDetails} details - Completed request details
     * @returns {string} Formatted log message
     */
    completed = (details: CompletedRequestDetails): string => {
        let message = `Request completed: method=${details.method} path=${details.path} statusCode=${details.statusCode} durationMs=${details.durationMs}ms`;

        if (details.responseData) {
            message += ` body=${JSON.stringify(details.responseData)}`;
        }

        return message;
    };
}
