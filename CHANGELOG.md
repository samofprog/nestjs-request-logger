## CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed

- **Refactoring**: `GoStyleFormatter` renamed to `LogMessageFormatter` for clarity
  - Renamed class provides a more descriptive name reflecting its purpose
  - Better aligns with convention of naming formatters by their output type rather than language origin
  - All imports and tests updated accordingly
  - No functional changes - this is a pure naming refactor

---

## [3.1.0] - 2025-11-14

### Added

- **Comprehensive JSDoc documentation** for all source files with detailed descriptions and examples
- **Enhanced README** with:
  - Advanced usage examples and patterns
  - Troubleshooting guide with common issues and solutions
  - Complete API reference with parameter details
  - Version compatibility matrix (NestJS 8.x - 11.x)
  - Performance monitoring examples
  - Advanced security configuration examples
- **File-level documentation headers** indicating author, version, license, and purpose
- **Detailed parameter documentation** in all public functions with @param and @returns tags
- **Usage examples in JSDoc** for middleware, providers, and helper functions
- **Type documentation** with extended descriptions and usage patterns for all interfaces
- **Modular architecture** with organized structure:
  - Dedicated `constants/` folder for DI tokens
  - `factories/` folder for helper functions
  - `utils/` folder for utility classes
  - `middlewares/` folder (plural) for middleware implementations
  - `providers/` folder for NestJS providers
  - `types/` folder for type definitions
- **Index files** in all major folders for cleaner imports

### Changed

- **BREAKING: Package name** changed from `@samofprog/nestjs-http-logger` to `@samofprog/nestjs-request-logger`
- **BREAKING: Class naming** - `RequestLogger` renamed to `RequestLoggerMiddleware` following NestJS conventions
- **BREAKING: Type names** - All `HttpLogger*` types renamed to `RequestLogger*`:
  - `HttpLoggerOptions` → `RequestLoggerOptions`
  - `HttpLoggerModuleOptions` → `RequestLoggerModuleOptions`
  - `HttpLoggerAsyncOptions` → `RequestLoggerAsyncOptions`
- **BREAKING: Type file** - `http-logger-options.types.ts` → `request-logger-options.types.ts`
- **BREAKING: Option removed** - `logHeaders` boolean option removed in favor of `headerFields` array
  - Use `headerFields: ['content-type', 'authorization']` instead of `logHeaders: true`
  - Provides better granularity for which headers to log
- **BREAKING: Function removed** - `createHttpLoggerMiddleware()` renamed to `requestLoggerFactory()`
- **Folder structure** - `middleware/` → `middlewares/` (plural form)
- **Import paths** - All imports updated to use new modular structure with barrel exports
- **Function naming convention** - Provider factory functions use plural form
- **Type properties renamed** - `url` property changed to `path` in:
  - `RequestDetails` interface
  - `CompletedRequestDetails` interface
  - Log output format updated: `method=GET path=/api/users` (instead of `url=`)
  - Clarifies that logged value is a request path (not a full URL)
  - `createRequestLoggerProviders()` returns `Provider[]` collection
  - `createRequestLoggerAsyncProviders()` returns `Provider[]` collection

### Improved

- **Code organization**: Better separation of concerns with dedicated folders
- **Import ergonomics**: Cleaner imports using barrel exports (index.ts files)
- **Type consistency**: All naming follows NestJS community conventions
- **Code documentation clarity**: Every public function and interface now has comprehensive JSDoc comments
- **Type definitions**: Enhanced with detailed descriptions and real-world examples
- **Provider factories**: Documented both synchronous and asynchronous patterns with detailed examples
- **Middleware implementation**: Added comments explaining process flow and design decisions
- **README structure**: Reorganized for better navigation and discoverability

### Documentation

- Updated all code examples to use new package name and class names
- Updated all import statements in JSDoc examples
- Added table of contents structure to README
- Created "Requirements" section with Node.js and NestJS version information
- Added "🤝 Contributing" and "📧 Support" sections
- Included copyright and acknowledgments

### Fixed

- Enhanced error handling documentation in middleware comments
- Clarified sensitive header masking behavior in type definitions
- Improved path matching documentation with concrete examples
- Consistent naming conventions throughout the codebase

---

## [3.0.0] - 2025-11-08

### Added

- Helper function `createHttpLoggerMiddleware()` as the recommended approach
- Asynchronous provider factory `createHttpLoggerAsyncProviders()` for dynamic configuration
- Support for environment-based configuration through async factories

### Changed

- **BREAKING**: Restructured middleware integration approach
- Updated default configuration to not treat 3xx redirect status codes as errors
- Improved response logging to only log errors for status >= 400 (previously was >= 300)
- Enhanced middleware initialization process

### Improved

- Better default configuration out of the box
- More intuitive API for common use cases
- Support for async configuration scenarios

---

## [2.0.1] - 2025-05-22

### Added

- Added `sensitiveHeaders` option to mask sensitive headers in logs
- Implemented default header sanitizer function
- Added header sanitization to protect sensitive information
- Improved response time precision using `process.hrtime()`

### Changed

- Updated default log messages to include sanitized headers
- Improved type safety for header handling

### Fixed

- Fixed potential security issue with logging sensitive headers

## [2.0.0] - 2025-05-06

### Added

- Enhanced compatibility with both Express and Fastify frameworks
- Improved request and response message format with additional details
- Added support for logging headers in incoming requests
- Enhanced high-precision response time calculation using process.hrtime
- Better error detection with differential logging for responses with status codes >= 300

### Changed

- Completely redesigned message format customization through new parameter structure
- Updated signature for incomingRequestMessage and completedRequestMessage callback functions
- Improved framework detection and adaptation for request/response handling

### Fixed

- Fixed event handling for both Express and Fastify response objects
- Ensured compatibility with both frameworks when accessing URL and status information

## [1.0.4] - 2025-02-17

### Added

- Added support for ignored paths in logging middleware to prevent logging of specific routes like Swagger assets, CSS,
  JS, and favicon requests.

## [1.0.2] - 2025-01-13

### Added

- Introduced the `create` static method for easier instantiation of `HttpLoggerMiddleware`.
- Added support for a custom logger by providing a `logger` option in `HttpLoggerOptions`.
- Enhanced documentation with examples for using a custom logger and the `create` method.

### Changed

- Updated middleware implementation to use the `logger` option, allowing integration with the application's global or
  custom logger.

## [1.0.1] - 2025-01-07

### Added

- Added keywords in `package.json` to optimize search results.

### Fixed

- Corrected an issue with the middleware that caused it to behave incorrectly with Fastify.

### Removed

- Removed unit tests to rewrite them later with improved coverage and structure.

### Updated

- Updated project documentation and README.

## [1.0.0] - 2025-01-06

### Added

- Initial release of the `http-logger-middleware` package for NestJS.
- Middleware to log HTTP requests and responses in a customizable manner.
- Support for logging incoming requests with HTTP method and URL.
- Support for logging completed requests with HTTP method, URL, status code, and duration.
- Customizable messages for logging using `HttpLoggerOptions`.
- Optional configuration for error logging for requests with status codes >= 300.
- Added MIT License to the project.

### Changed

- N/A

### Fixed

- N/A