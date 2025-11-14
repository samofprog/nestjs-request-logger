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
    HttpLoggerOptions,
    PathPattern,
    Req,
    RequestDetails,
    Res,
} from '../types';

const DEFAULT_SENSITIVE_HEADERS = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
] as const;

export const HTTP_LOGGER_OPTIONS = 'HTTP_LOGGER_OPTIONS';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger: LoggerService;
    private readonly sanitizeHeaders: (headers: Headers) => Headers;
    private readonly formatter: {
        incoming: (details: RequestDetails) => string;
        completed: (details: CompletedRequestDetails) => string;
    };
    private readonly shouldIgnorePath: (url: string) => boolean;

    constructor(
        @Inject(HTTP_LOGGER_OPTIONS)
        private readonly options: Partial<HttpLoggerOptions> = {}
    ) {
        this.logger =
            this.options.logger ?? new Logger(HttpLoggerMiddleware.name);
        this.sanitizeHeaders = this.createHeaderSanitizer(
            this.options.sensitiveHeaders ?? DEFAULT_SENSITIVE_HEADERS
        );
        this.formatter = this.createFormatter(this.options);
        this.shouldIgnorePath = this.createPathMatcher(
            this.options.ignorePaths ?? []
        );
    }

    use(req: Req, res: Res, next: () => void): void {
        const startTime = process.hrtime();
        const method = req.method;
        const url = this.extractUrl(req);

        if (this.shouldIgnorePath(url)) {
            next();
            return;
        }

        this.logIncomingRequest(
            req,
            method,
            url,
            this.logger,
            this.sanitizeHeaders,
            this.formatter,
            this.options
        );
        this.setupResponseLogging(
            res,
            method,
            url,
            startTime,
            this.logger,
            this.formatter
        );

        next();
    }

    private createHeaderSanitizer(
        sensitiveKeys: readonly string[] = DEFAULT_SENSITIVE_HEADERS
    ): (headers: Headers) => Headers {
        const sensitiveSet = new Set(
            sensitiveKeys.map((key) => key.toLowerCase())
        );

        return (headers: Headers): Headers => {
            const sanitized: Headers = {};

            for (const [key, value] of Object.entries(headers)) {
                sanitized[key] = sensitiveSet.has(key.toLowerCase())
                    ? '*****'
                    : value;
            }

            return sanitized;
        };
    }

    private createFormatter(options: Partial<HttpLoggerOptions>): {
        incoming: (details: RequestDetails) => string;
        completed: (details: CompletedRequestDetails) => string;
    } {
        const logHeaders = options.logHeaders ?? false;
        const logRequestBody = options.logRequestBody ?? false;

        const defaultFormatter = this.createMessageFormatter(
            logHeaders,
            logRequestBody
        );

        return {
            incoming:
                options.incomingRequestMessage ?? defaultFormatter.incoming,
            completed:
                options.completedRequestMessage ?? defaultFormatter.completed,
        };
    }

    private createMessageFormatter(
        logHeaders: boolean = false,
        logRequestBody: boolean = false
    ): {
        incoming: (details: RequestDetails) => string;
        completed: (details: CompletedRequestDetails) => string;
    } {
        const formatIncomingRequest = (details: RequestDetails): string => {
            const { method, url, headers, body } = details;

            let message = `Incoming request → ${method.toUpperCase()} ${url}`;

            if (logHeaders && headers && Object.keys(headers).length > 0) {
                const headersStr = () => JSON.stringify(headers);
                message += ` with headers ${headersStr()}`;
            }

            if (logRequestBody && body !== undefined) {
                const bodyStr = () => JSON.stringify(body);
                message += ` with body ${bodyStr()}`;
            }

            return message;
        };

        const formatCompletedRequest = (
            details: CompletedRequestDetails
        ): string => {
            const { method, url, statusCode, durationMs } = details;

            return `Completed request ← ${method.toUpperCase()} ${url} with status ${statusCode} in ${durationMs} ms`;
        };

        return {
            incoming: formatIncomingRequest,
            completed: formatCompletedRequest,
        };
    }

    private needsRegex(path: string): boolean {
        return path.includes('*') || path.includes('[') || path.includes('(');
    }

    private createPathMatcher(
        ignorePaths: string[] = []
    ): (url: string) => boolean {
        const patterns: PathPattern[] = ignorePaths.map((path) =>
            this.needsRegex(path) ? new RegExp(path.replace(/\*/g, '.*')) : path
        );

        return (url: string): boolean => {
            return patterns.some((pattern) =>
                typeof pattern === 'string'
                    ? url.includes(pattern)
                    : pattern.test(url)
            );
        };
    }

    private extractUrl(req: Req): string {
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
            const rawReq = req.raw as any;
            if (rawReq.originalUrl) {
                return rawReq.originalUrl;
            }
            if (rawReq.url) {
                return rawReq.url;
            }
        }

        // Fastify direct access
        if ('url' in req && req.url) {
            return req.url;
        }

        // Fallback for any other properties
        if ('path' in req && (req as any).path) {
            return (req as any).path;
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
            const rawReq = req.raw as any;
            if (rawReq.body !== undefined) {
                return rawReq.body;
            }
        }

        // Try to access body from different property names
        const reqAny = req as any;
        if (reqAny.payload !== undefined) {
            return reqAny.payload;
        }

        if (reqAny._body !== undefined) {
            return reqAny._body;
        }

        return undefined;
    }

    private logIncomingRequest(
        req: Req,
        method: string,
        url: string,
        logger: LoggerService,
        sanitizeHeaders: (headers: Headers) => Headers,
        formatter: { incoming: (details: RequestDetails) => string },
        options: Partial<HttpLoggerOptions>
    ): void {
        const sanitizedHeaders = sanitizeHeaders(
            (req.headers as Headers) ?? {}
        );
        const requestBody = this.extractBody(req);

        const message = formatter.incoming({
            method,
            url,
            headers: options.logHeaders !== false ? sanitizedHeaders : {},
            body: options.logRequestBody ? requestBody : undefined,
        });

        logger.log(message);
    }

    private setupResponseLogging(
        res: Res,
        method: string,
        url: string,
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
                url,
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
