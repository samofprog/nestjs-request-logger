/**
 * @file Request Logger Middleware for NestJS
 * @description Comprehensive HTTP request and response logging middleware with security features
 * @author samofprog
 * @version 3.1.0
 * @license MIT
 *
 * This middleware provides:
 * - Detailed request/response logging
 * - High-precision timing measurement (nanosecond accuracy)
 * - Sensitive header masking for security
 * - Path-based filtering for ignored routes
 * - Customizable log formatting
 * - Support for Express and Fastify frameworks
 * - Automatic error detection based on HTTP status codes
 *
 * @example
 * ```typescript
 * // In your main.ts
 * const app = await NestFactory.create(AppModule);
 * app.use(requestLoggerFactory({ headerFields: ['content-type', 'authorization'] }));
 * await app.listen(3000);
 * ```
 */

import {
    Inject,
    Injectable,
    Logger,
    LoggerService,
    NestMiddleware,
} from '@nestjs/common';

import {
    CompletedRequestDetails,
    Headers,
    RequestLoggerOptions,
    Req,
    RequestDetails,
    Res,
} from '../types';
import { LogMessageFormatter, HeaderSanitizer, PathMatcher } from '../utils';
import { REQUEST_LOGGER_OPTIONS } from '../constants';

/**
 * Request Logger Middleware for NestJS applications.
 *
 * This middleware intercepts all HTTP requests and logs:
 * - Incoming request details (method, URL, headers, body)
 * - Response completion details (status code, duration)
 * - Automatically differentiates between success and error logs based on status codes
 *
 * Features:
 * - **Security**: Automatically masks sensitive headers (auth, cookies, API keys)
 * - **Performance**: Uses high-precision timing for accurate duration measurement
 * - **Framework Support**: Works with both Express and Fastify adapters
 * - **Customization**: Supports custom formatters, header sanitizers, and path matchers
 * - **Filtering**: Can ignore specific paths (e.g., health checks, metrics endpoints)
 *
 * @class RequestLoggerMiddleware
 * @implements {NestMiddleware}
 *
 * @example
 * ```typescript
 * // Using with dependency injection
 * import { Module } from '@nestjs/common';
 * import { createRequestLoggerProviders } from '@samofprog/nestjs-request-logger';
 *
 * @Module({
 *   providers: createRequestLoggerProviders({
 *     headerFields: ['content-type', 'authorization'],
 *     logRequestBody: true,
 *     ignorePaths: ['/health', '/metrics', '/static/*'],
 *   }),
 * })
 * export class LoggerModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Using the helper function (recommended for simplicity)
 * import { requestLoggerFactory } from '@samofprog/nestjs-request-logger';
 *
 * const app = await NestFactory.create(AppModule);
 * app.use(requestLoggerFactory({
 *   headerFields: ['content-type', 'authorization'],
 *   ignorePaths: ['/health'],
 * }));
 * ```
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    private readonly logger: LoggerService;
    private readonly headerSanitizer: HeaderSanitizer;
    private readonly pathMatcher: PathMatcher;
    private readonly formatter: {
        incoming: (details: RequestDetails) => string;
        completed: (details: CompletedRequestDetails) => string;
    };

    constructor(
        @Inject(REQUEST_LOGGER_OPTIONS)
        private readonly options: Partial<RequestLoggerOptions> = {}
    ) {
        this.logger =
            this.options.logger ?? new Logger(RequestLoggerMiddleware.name);
        this.headerSanitizer = new HeaderSanitizer(
            this.options.sensitiveHeaders
        );
        this.pathMatcher = new PathMatcher(this.options.ignorePaths ?? []);
        this.formatter = this.createFormatter(this.options);
    }

    /**
     * Main middleware function that intercepts HTTP requests and responses.
     *
     * Process Flow:
     * 1. Records the start time using high-precision timer (process.hrtime)
     * 2. Extracts request method and URL
     * 3. Checks if the path should be ignored
     * 4. Logs incoming request details if not ignored
     * 5. Sets up response completion handler to log duration and status code
     * 6. Calls next middleware in the chain
     *
     * @param {Req} req - The HTTP request object (Express Request or Fastify Request)
     * @param {Res} res - The HTTP response object (Express Response or Fastify Reply)
     * @param {Function} next - Callback to pass control to the next middleware
     * @returns {void}
     *
     * @example
     * ```typescript
     * middleware.use(req, res, () => {
     *   // Next middleware or route handler executed
     * });
     * ```
     */
    use(req: Req, res: Res, next: () => void): void {
        const startTime = process.hrtime();
        const method = req.method;
        const path = this.extractPath(req);

        if (this.pathMatcher.matches(path)) {
            next();
            return;
        }

        this.logIncomingRequest(
            req,
            method,
            path,
            this.logger,
            this.formatter,
            this.options
        );
        this.setupResponseLogging(
            res,
            method,
            path,
            startTime,
            this.logger,
            this.formatter
        );

        next();
    }

    private createFormatter(options: Partial<RequestLoggerOptions>): {
        incoming: (details: RequestDetails) => string;
        completed: (details: CompletedRequestDetails) => string;
    } {
        // Use custom formatters if provided, otherwise use LogMessageFormatter
        if (options.incomingRequestMessage || options.completedRequestMessage) {
            return {
                incoming:
                    options.incomingRequestMessage ||
                    ((): string => 'incoming request'),
                completed:
                    options.completedRequestMessage ||
                    ((): string => 'request completed'),
            };
        }

        // Use default LogMessageFormatter
        const logMessageFormatter = new LogMessageFormatter({
            headerFields: options.headerFields ?? [],
            logRequestBody: options.logRequestBody ?? false,
            sensitiveHeaders: options.sensitiveHeaders,
        });

        return {
            incoming: logMessageFormatter.incoming,
            completed: logMessageFormatter.completed,
        };
    }

    private extractPath(req: Req): string {
        // Express adapter
        if ('originalUrl' in req && req.originalUrl) {
            return req.originalUrl;
        }

        // Express adapter fallback
        if ('url' in req && req.url && req.url !== '/') {
            return req.url;
        }

        // Fastify adapter
        if ('raw' in req && req.raw) {
            const rawReq = req.raw as unknown as Record<string, unknown>;
            if (rawReq.originalUrl && typeof rawReq.originalUrl === 'string') {
                return rawReq.originalUrl;
            }
            if (rawReq.url && typeof rawReq.url === 'string') {
                return rawReq.url;
            }
        }

        // Fastify direct access
        if ('url' in req && req.url) {
            return req.url;
        }

        // Fallback for any other properties
        const pathValue = (req as unknown as Record<string, unknown>).path;
        if (pathValue && typeof pathValue === 'string') {
            return pathValue;
        }

        return '/';
    }

    private extractBody(req: Req): unknown {
        // Express adapter
        if ('body' in req && req.body !== undefined) {
            return req.body;
        }

        // Fastify adapter
        if ('raw' in req && req.raw) {
            const rawReq = req.raw as unknown as Record<string, unknown>;
            if (rawReq.body !== undefined) {
                return rawReq.body;
            }
        }

        // Try to access body from different property names
        const reqRecord = req as unknown as Record<string, unknown>;
        if (reqRecord.payload !== undefined) {
            return reqRecord.payload;
        }

        if (reqRecord._body !== undefined) {
            return reqRecord._body;
        }

        return undefined;
    }

    private logIncomingRequest(
        req: Req,
        method: string,
        path: string,
        logger: LoggerService,
        formatter: { incoming: (details: RequestDetails) => string },
        options: Partial<RequestLoggerOptions>
    ): void {
        const sanitizedHeaders = this.headerSanitizer.sanitize(
            (req.headers as Headers) ?? {}
        );
        const requestBody = this.extractBody(req);

        const message = formatter.incoming({
            method,
            path,
            headers: options.headerFields ? sanitizedHeaders : {},
            body: options.logRequestBody ? requestBody : undefined,
        });

        logger.log(message);
    }

    private setupResponseLogging(
        res: Res,
        method: string,
        path: string,
        startTime: [number, number],
        logger: LoggerService,
        formatter: { completed: (details: CompletedRequestDetails) => string }
    ): void {
        const onFinish = (): void => {
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);
            const statusCode = res.statusCode;

            const message = formatter.completed({
                method,
                path,
                statusCode,
                durationMs,
            });

            if (statusCode >= 400) {
                logger.error(message);
            } else {
                logger.log(message);
            }
        };

        if ('raw' in res && res.raw) {
            res.raw.once('finish', onFinish);
        } else if ('once' in res && typeof res.once === 'function') {
            res.once('finish', onFinish);
        }
    }
}
