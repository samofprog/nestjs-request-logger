## CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-12-27

### Fixed

- **peerDependencies compatibility**: Updated `@nestjs/common` peer dependency to include `^11.0.0` to match advertised NestJS 11.x support (PR #14)
  - Previously, the package advertised NestJS 11.x support but `peerDependencies` only allowed versions 8-10, requiring users to force flag installation
  - Thanks to [@blair-stewart](https://github.com/blair-stewart) for the contribution

### Changed

- **CI/CD improvements**: Refactored GitHub Actions workflows
  - Tests now run on all branches and pull requests (not just main/develop)
  - Simplified to single Node.js 22.x version
  - Separated manual deployment workflow for better control over NPM publishing

---

## [1.0.0] - 2025-11-16

### Added

- **Initial release** of `@samofprog/nestjs-request-logger` - A production-ready HTTP middleware for NestJS
- **Comprehensive request/response logging** with:
  - HTTP method, path, status code, and duration tracking
  - Automatic request/response timing with nanosecond precision
  - Customizable header field extraction and logging
  - Request body logging (optional)
  - Response data logging (optional)

- **Security-First Design**:
  - Automatic masking of sensitive headers (authorization, cookies, API keys)
  - Configurable sensitive headers list
  - Custom header sanitization support
  - Prevents exposure of sensitive data in logs

- **Flexible Configuration**:
  - Path-based filtering to ignore specific routes
  - Support for exact matches, wildcards, and regex patterns
  - Custom log message formatters
  - Integration with NestJS LoggerService
  - Fallback to NestJS global logger

- **Framework Support**:
  - Full Express adapter support
  - Full Fastify adapter support
  - Framework-agnostic middleware implementation

- **Structured Logging**:
  - Key=value format with camelCase keys for easy parsing
  - Descriptive prefixes for request lifecycle identification
  - Default format:
    - Incoming: `Incoming request: method=GET path=/api/users`
    - Completed: `Request completed: method=GET path=/api/users statusCode=200 durationMs=45ms`

- **Developer Experience**:
  - Zero external dependencies
  - Full TypeScript support with strict type safety
  - Comprehensive JSDoc documentation
  - Extensive test coverage (97 tests)
  - Pre-configured with Husky for code quality

- **Helper Functions**:
  - `requestLoggerFactory()` - Simple one-liner integration
  - `createRequestLoggerProviders()` - Advanced DI setup
  - `createRequestLoggerAsyncProviders()` - Dynamic configuration support

- **Default Sensitive Headers**:
  - `authorization`
  - `cookie`
  - `set-cookie`
  - `x-api-key`

### Features

- Detailed request and response logging
- Sensitive header masking
- Path-based filtering
- Custom log message formatting
- Custom logger support
- Log level distinction (success vs error)
- Express and Fastify compatibility
- Configurable logging levels

### Testing

- 97 comprehensive unit tests covering:
  - Middleware functionality (36 tests)
  - Log message formatting (14 tests)
  - Header sanitization (15 tests)
  - Field extraction (16 tests)
  - Path matching including query strings (12 tests)
- Full code coverage with ESLint and TypeScript strict mode
- Pre-commit hooks with Husky v9

### Documentation

- Complete README with usage examples
- JSDoc comments on all public APIs
- Examples for common use cases
- Troubleshooting guide
- Version compatibility matrix (NestJS 8.x - 11.x)
- API reference