/**
 * @file Header Sanitizer Utility Class
 * @description Sanitizes headers by masking sensitive information
 * @author samofprog
 * @license MIT
 */

import { Headers } from '../types';
import { DEFAULT_SENSITIVE_HEADERS } from '../constants';

/**
 * Utility class for sanitizing sensitive headers.
 *
 * Purpose:
 * - Masks sensitive headers (authorization, cookies, API keys, etc)
 * - Provides O(1) lookup performance using Set
 * - Supports custom sensitive header lists
 *
 * @class HeaderSanitizer
 *
 * @example
 * ```typescript
 * import { HeaderSanitizer } from '@samofprog/nestjs-request-logger/utils';
 *
 * // Use default sensitive headers
 * const sanitizer = new HeaderSanitizer();
 * const sanitized = sanitizer.sanitize(headers);
 *
 * // Or use custom list
 * const customSanitizer = new HeaderSanitizer({
 *   sensitiveHeaders: ['authorization', 'x-api-key', 'x-custom-secret']
 * });
 * ```
 */
export class HeaderSanitizer {
    private readonly sensitiveSet: Set<string>;

    /**
     * Create a new HeaderSanitizer instance
     *
     * @param {string[]} sensitiveHeaders - Header names to mask (case-insensitive)
     *                                     @default DEFAULT_SENSITIVE_HEADERS
     */
    constructor(
        sensitiveHeaders: readonly string[] = DEFAULT_SENSITIVE_HEADERS
    ) {
        // Pre-compute lowercase sensitive header names for O(1) lookup
        this.sensitiveSet = new Set(
            sensitiveHeaders.map((key) => key.toLowerCase())
        );
    }

    /**
     * Sanitize headers by masking sensitive values
     *
     * @param {Headers} headers - Headers object to sanitize
     * @returns {Headers} Sanitized headers object
     */
    sanitize(headers: Headers | undefined): Headers {
        if (!headers) {
            return {};
        }

        const headerKeys = Object.keys(headers);
        const sanitized: Headers = {};

        for (const key of headerKeys) {
            const lowerKey = key.toLowerCase();
            sanitized[key] = this.sensitiveSet.has(lowerKey)
                ? '[REDACTED]'
                : headers[key];
        }

        return sanitized;
    }
}
