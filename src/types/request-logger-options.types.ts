/**
 * @file Request Logger Options Types
 * @description Type definitions for request logger configuration options
 * @author samofprog
 * @license MIT
 */

import {
    InjectionToken,
    LoggerService,
    OptionalFactoryDependency,
} from '@nestjs/common';
import { Headers, RequestDetails, CompletedRequestDetails } from './index';

/**
 * Sanitizer configuration options
 */
export interface SanitizerConfig {
    sensitiveHeaders?: string[];
    sanitizeHeaders?: (headers: Headers) => Headers;
}

/**
 * Formatter configuration options
 */
export interface FormatterConfig {
    incomingRequestMessage?: (details: RequestDetails) => string;
    completedRequestMessage?: (details: CompletedRequestDetails) => string;
}

/**
 * Path matcher configuration options
 */
export interface PathMatcherConfig {
    ignorePaths?: string[];
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
    logger?: LoggerService;
    logRequestBody?: boolean;
    headerFields?: string[];
}

/**
 * Main request logger options interface
 * Combines all configuration options for the logger
 */
export interface RequestLoggerOptions
    extends SanitizerConfig,
        FormatterConfig,
        PathMatcherConfig,
        LoggerConfig {}

/**
 * Partial request logger options for module configuration
 */
export type RequestLoggerModuleOptions = Partial<RequestLoggerOptions>;

/**
 * Async request logger options for dynamic module configuration
 */
export interface RequestLoggerAsyncOptions {
    useFactory: (
        ...args: unknown[]
    ) => Promise<RequestLoggerModuleOptions> | RequestLoggerModuleOptions;
    inject?: (InjectionToken | OptionalFactoryDependency)[];
}
