/**
 * @file Types Export Hub
 * @description Central export for all type definitions
 * @author samofprog
 * @license MIT
 */

// Request/Response types
export type { Req, Res, ExpressRes, FastifyRes } from './req-res.types';

// Data structure types
export type { Headers } from './headers.types';
export type { RequestDetails } from './request-details.types';
export type { CompletedRequestDetails } from './response-details.types';
export type { PathPattern } from './path-pattern.types';

// Configuration types
export type {
    RequestLoggerOptions,
    RequestLoggerModuleOptions,
    RequestLoggerAsyncOptions,
    SanitizerConfig,
    FormatterConfig,
    PathMatcherConfig,
    LoggerConfig,
} from './request-logger-options.types';

// Utility types
export type { PathMatcherFunction } from './path-matcher.types';
export type { HeaderFieldExtractorFunction } from './header-field-extractor.types';
export type { HeaderSanitizerFunction } from './header-sanitizer.types';
export type { NestedExtractorFunction } from './nested-extractor.types';
export type {
    IncomingRequestFormatter,
    CompletedRequestFormatter,
    MessageFormatters,
} from './message-formatter.types';
