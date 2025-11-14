/**
 * @file Request Logger Provider Factory
 * @description NestJS dependency injection providers for request logger middleware
 * @author samofprog
 * @license MIT
 *
 * This module provides factory functions that create NestJS providers
 * for integrating the request logger middleware through the dependency injection container.
 * Useful for more advanced configurations and modular setups.
 */

import { Provider } from '@nestjs/common';
import {
    RequestLoggerAsyncOptions,
    RequestLoggerModuleOptions,
} from '../types';
import { REQUEST_LOGGER_OPTIONS } from '../constants';
import { RequestLoggerMiddleware } from '../middlewares';

/**
 * Creates synchronous NestJS providers for the request logger middleware.
 *
 * This function returns an array of providers that can be registered in a module.
 * Use this when you have static configuration that doesn't depend on other services.
 *
 * The returned providers include:
 * - **REQUEST_LOGGER_OPTIONS provider**: Provides the configuration token with static options
 * - **RequestLoggerMiddleware class**: Registers the middleware class for dependency injection
 *
 * Process:
 * 1. Creates a value provider for REQUEST_LOGGER_OPTIONS token
 * 2. Adds the RequestLoggerMiddleware class for DI container
 * 3. Returns both providers to be registered in your module
 *
 * @param {RequestLoggerModuleOptions} [options={}] - Static configuration options
 * @param {boolean} [options.logHeaders=false] - Whether to log request headers
 * @param {boolean} [options.logRequestBody=false] - Whether to log request body
 * @param {string[]} [options.ignorePaths=[]] - Paths to ignore from logging
 * @param {string[]} [options.sensitiveHeaders] - Custom list of sensitive headers to mask
 * @param {LoggerService} [options.logger] - Custom logger service instance
 * @returns {Provider[]} Array of NestJS providers
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { createRequestLoggerProviders } from '@samofprog/nestjs-request-logger';
 * import { AppController } from './app.controller';
 * import { AppService } from './app.service';
 *
 * @Module({
 *   controllers: [AppController],
 *   providers: [
 *     AppService,
 *     ...createRequestLoggerProviders({
 *       logHeaders: true,
 *       ignorePaths: ['/health', '/metrics'],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Later in a middleware or module registration
 * export class LoggerMiddlewareConsumer implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(RequestLoggerMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @see {@link createRequestLoggerAsyncProviders} for async/dynamic configuration
 */
export function createRequestLoggerProviders(
    options: RequestLoggerModuleOptions = {}
): Provider[] {
    return [
        {
            provide: REQUEST_LOGGER_OPTIONS,
            useValue: options,
        },
        RequestLoggerMiddleware,
    ];
}

/**
 * Creates asynchronous NestJS providers for the request logger middleware.
 *
 * This function is useful when you need to:
 * - Load configuration from environment variables or files at runtime
 * - Depend on other services for configuration (e.g., ConfigService, DatabaseService)
 * - Implement dynamic configuration based on application state
 * - Delay middleware initialization until other services are ready
 *
 * The returned providers include:
 * - **REQUEST_LOGGER_OPTIONS provider**: Uses a factory function to resolve options dynamically
 * - **RequestLoggerMiddleware class**: Registers the middleware class for dependency injection
 *
 * Process:
 * 1. Creates a factory provider for REQUEST_LOGGER_OPTIONS token
 * 2. Injects specified dependencies into the factory function
 * 3. Calls the factory function to resolve configuration at runtime
 * 4. Returns both providers to be registered in your module
 *
 * @param {RequestLoggerAsyncOptions} options - Async configuration options
 * @param {Function} options.useFactory - Factory function that returns logger options or a Promise
 * @param {InjectionToken[]} [options.inject=[]] - Array of tokens for services to inject into useFactory
 * @returns {Provider[]} Array of NestJS async providers
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { ConfigModule, ConfigService } from '@nestjs/config';
 * import { createRequestLoggerAsyncProviders } from '@samofprog/nestjs-request-logger';
 *
 * @Module({
 *   imports: [ConfigModule.forRoot()],
 *   providers: [
 *     ...createRequestLoggerAsyncProviders({
 *       useFactory: async (configService: ConfigService) => ({
 *         logHeaders: configService.get('LOG_HEADERS') === 'true',
 *         logRequestBody: configService.get('LOG_BODY') === 'true',
 *         ignorePaths: configService.get('IGNORE_PATHS', '/health,/metrics').split(','),
 *       }),
 *       inject: [ConfigService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * export class LoggerMiddlewareConsumer implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(RequestLoggerMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With database service dependency
 * @Module({
 *   providers: [
 *     ...createRequestLoggerAsyncProviders({
 *       useFactory: async (dbService: DatabaseService) => {
 *         const config = await dbService.getLoggerConfig();
 *         return {
 *           logHeaders: config.headers,
 *           logRequestBody: config.body,
 *           ignorePaths: config.ignorePaths,
 *         };
 *       },
 *       inject: [DatabaseService],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @see {@link createRequestLoggerProviders} for synchronous configuration
 */
export function createRequestLoggerAsyncProviders(
    options: RequestLoggerAsyncOptions
): Provider[] {
    return [
        {
            provide: REQUEST_LOGGER_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || [],
        },
        RequestLoggerMiddleware,
    ];
}
