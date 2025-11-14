/**
 * @file Request Logger Factory Utility
 * @description Factory function to create request logger middleware instances
 * @author samofprog
 * @license MIT
 *
 * This module provides a convenient utility function for creating and
 * binding request logger middleware with minimal configuration.
 */

import { RequestLoggerOptions, Req, Res } from '../types';
import { Logger } from '@nestjs/common';
import { RequestLoggerMiddleware } from '../middlewares';

/**
 * Creates a request logger middleware instance and returns its bound use method.
 *
 * This is the **recommended approach** for integrating the request logger middleware
 * into your NestJS application. It handles:
 * - Automatic instantiation of the middleware class
 * - Default logger creation (NestJS Logger)
 * - Proper binding of the `use` method to the middleware context
 *
 * Process:
 * 1. Creates a new RequestLoggerMiddleware instance with provided options
 * 2. Instantiates a default NestJS Logger automatically
 * 3. Binds the `use` method to the middleware context
 * 4. Returns the bound middleware function ready to be used with `app.use()`
 *
 * @param {Partial<RequestLoggerOptions>} [options={}] - Configuration options for the logger
 * @param {boolean} [options.logHeaders=false] - Whether to log request headers (sanitized)
 * @param {boolean} [options.logRequestBody=false] - Whether to log request body
 * @param {string[]} [options.ignorePaths=[]] - Paths to ignore from logging (supports wildcards)
 * @param {string[]} [options.sensitiveHeaders] - Custom list of sensitive headers to mask
 * @param {LoggerService} [options.logger] - Custom logger service instance
 * @param {Function} [options.incomingRequestMessage] - Custom formatter for incoming requests
 * @param {Function} [options.completedRequestMessage] - Custom formatter for completed requests
 * @returns {Function} Express/Fastify compatible middleware function
 *
 * @example
 * ```typescript
 * // Basic usage
 * import { NestFactory } from '@nestjs/core';
 * import { requestLoggerFactory } from '@samofprog/nestjs-request-logger';
 * import { AppModule } from './app.module';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   app.use(requestLoggerFactory());
 *   await app.listen(3000);
 * }
 *
 * bootstrap();
 * ```
 *
 * @example
 * ```typescript
 * // With custom configuration
 * app.use(requestLoggerFactory({
 *   logHeaders: true,
 *   logRequestBody: true,
 *   ignorePaths: ['/health', '/metrics', '/static/*'],
 *   sensitiveHeaders: ['authorization', 'x-api-key', 'x-custom-token'],
 * }));
 * ```
 *
 * @example
 * ```typescript
 * // With custom message formatters
 * app.use(requestLoggerFactory({
 *   incomingRequestMessage: (details) => {
 *     return `${details.method} ${details.url} received`;
 *   },
 *   completedRequestMessage: (details) => {
 *     return `${details.method} ${details.url} completed with ${details.statusCode} in ${details.durationMs}ms`;
 *   },
 * }));
 * ```
 */
export function requestLoggerFactory(
    options: Partial<RequestLoggerOptions> = {}
): (req: Req, res: Res, next: () => void) => void {
    const middleware = new RequestLoggerMiddleware({
        logger: new Logger(RequestLoggerMiddleware.name),
        ...options,
    });
    return middleware.use.bind(middleware);
}
