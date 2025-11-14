# 📡 NestJS Request Logger

[![npm version](https://img.shields.io/npm/v/@samofprog/nestjs-request-logger.svg)](https://www.npmjs.com/package/@samofprog/nestjs-request-logger)
[![npm downloads](https://img.shields.io/npm/dm/@samofprog/nestjs-request-logger.svg)](https://www.npmjs.com/package/@samofprog/nestjs-request-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@samofprog/nestjs-request-logger.svg)](https://nodejs.org/)

A powerful, production-ready HTTP middleware for logging requests and responses in NestJS applications with enterprise-grade features.

## Overview

**NestJS Request Logger** provides comprehensive HTTP request/response logging with:
- **Security-First Design**: Automatic masking of sensitive headers (authorization, cookies, API keys)
- **High-Precision Timing**: Nanosecond-accurate request duration measurement
- **Framework Agnostic**: Full support for Express and Fastify adapters
- **Flexible Configuration**: Customizable formatters, sanitizers, and path filters
- **Production Ready**: Zero external dependencies, extensive error handling, TypeScript support

Perfect for debugging, monitoring, auditing, and compliance requirements in enterprise NestJS applications.

## ✨ Features

| Feature                                  | Description                                                    |
|------------------------------------------|----------------------------------------------------------------|
| 📥 Detailed request and response logging | Logs HTTP method, path, headers, status codes, and duration     |
| 🔒 Sensitive header masking              | Allows masking sensitive headers like Authorization or Cookie  |
| 🚫 Path ignoring                         | Ignore logging on specific paths                               |
| 📝 Custom log message formatting         | Customize incoming and completed request log messages          |
| 🛠 Custom logger support                 | Use your own LoggerService or fallback to NestJS global logger |
| ⚠️ Log level distinction                 | Successful responses logged with `log`, errors with `error`    |
| ⚙️ Framework compatibility               | Works with both Express and Fastify                            |
| 🎛️ Configurable logging levels          | Control what data to log: headers, request body, response data |

## 📦 Installation

Install the package using npm or yarn:

```bash
npm install @samofprog/nestjs-request-logger
# or
yarn add @samofprog/nestjs-request-logger
```

---

## 🚀 Usage

### Method 1: Using the Helper Function (Recommended)

Use the helper function in your NestJS bootstrap file:

```typescript
import { requestLoggerFactory } from '@samofprog/nestjs-request-logger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(requestLoggerFactory());

  await app.listen(3000);
}
bootstrap();
```

### Method 2: Using Providers (Advanced)

For more advanced use cases with dependency injection:

```typescript
import { createRequestLoggerProviders } from '@samofprog/nestjs-request-logger';

@Module({
  providers: [
    ...createRequestLoggerProviders({
      ignorePaths: ['/health'],
      headerFields: ['content-type', 'authorization'],
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
```

## ⚙️ Usage with Custom Configuration

You can customize the middleware behavior with options:

```typescript
import { requestLoggerFactory } from '@samofprog/nestjs-request-logger';

app.use(requestLoggerFactory({
  ignorePaths: ['/health', '/metrics'],
  sensitiveHeaders: ['authorization', 'cookie'],
  sanitizeHeaders: (headers) => {
    const sanitized = { ...headers };
    ['authorization', 'cookie'].forEach(key => {
      if (sanitized[key]) sanitized[key] = '[REDACTED]';
    });
    return sanitized;
  },
  incomingRequestMessage: (details) =>
    `Incoming: ${details.method} ${details.url} → headers: ${JSON.stringify(details.headers)}`,
  completedRequestMessage: (details) =>
    `Completed: ${details.method} ${details.url} ← status ${details.statusCode} in ${details.durationMs} ms`,
}));
```

---

## 🛠 Options

| Option                    | Type                                                    | Description                                                                                                    | Default                       |
|---------------------------|---------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-------------------------------|
| `logger`                  | `LoggerService`                                         | Custom logger implementing NestJS `LoggerService` interface.                                                   | NestJS default logger         |
| `ignorePaths`             | `string[]`                                              | List of URL paths to ignore from logging.                                                                      | `[]`                          |
| `sensitiveHeaders`        | `string[]`                                              | List of header names to mask in logs (case-insensitive).                                                       | `['authorization', 'cookie', 'set-cookie', 'x-api-key']` |
| `sanitizeHeaders`         | `(headers: Record<string, any>) => Record<string, any>` | Function to transform headers before logging (e.g., to mask values).                                           | Identity function (no change) |
| `incomingRequestMessage`  | `(details) => string`                                   | Function returning the log message for incoming requests. Receives `{ method, url, headers, body }`.           | Default formatted string      |
| `completedRequestMessage` | `(details) => string`                                   | Function returning the log message for completed requests. Receives `{ method, url, statusCode, durationMs }`. | Default formatted string      |
| `logRequestBody`          | `boolean`                                               | Whether to include request body in the log messages.                                                           | `false`                       |
| `headerFields`            | `string[]`                                              | List of specific header fields to include in logs.                                                             | All headers                   |

---

## 🧩 Examples

### 🚫 Ignore paths and 🔒 mask sensitive headers

```typescript
app.use(requestLoggerFactory({
  ignorePaths: ['/health', '/metrics'],
  sensitiveHeaders: ['authorization', 'cookie'],
}));
```

### 🧼 Custom sanitization of headers

```typescript
app.use(requestLoggerFactory({
  sanitizeHeaders: (headers) => {
    const sanitized = { ...headers };
    if (sanitized['authorization']) sanitized['authorization'] = '[TOKEN REDACTED]';
    if (sanitized['cookie']) sanitized['cookie'] = '[COOKIE REDACTED]';
    return sanitized;
  }
}));
```

### 🎛️ Configure logging levels

```typescript
app.use(requestLoggerFactory({
  logRequestBody: true,    // Include request body in logs (default: false)
  headerFields: ['content-type', 'authorization'], // Specific headers to log
}));
```

### 🛠 Custom logger

```typescript
import { Logger } from '@nestjs/common';

const customLogger = new Logger('MyCustomLogger');

app.use(requestLoggerFactory({ logger: customLogger }));
```

### 🔧 Default Sensitive Headers

By default, the following headers are automatically masked:

```typescript
const DEFAULT_SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key'
];
```

### 📊 Custom Message Formatters

Format log messages to match your requirements:

```typescript
app.use(requestLoggerFactory({
  incomingRequestMessage: (details) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] → ${details.method} ${details.url}`;
  },
  completedRequestMessage: (details) => {
    const logLevel = details.statusCode >= 400 ? '❌ ERROR' : '✅ SUCCESS';
    return `[${logLevel}] ← ${details.method} ${details.url} | Status: ${details.statusCode} | Duration: ${details.durationMs}ms`;
  },
}));
```

### 🔗 With ConfigService (NestJS Config)

Load configuration from environment variables:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { requestLoggerFactory } from '@samofprog/nestjs-request-logger';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const headerFields = this.configService.get('HEADER_FIELDS', '').split(',').filter(Boolean);
    const logBody = this.configService.get('LOG_REQUEST_BODY') === 'true';
    const ignorePaths = this.configService.get('IGNORE_PATHS', '/health,/metrics').split(',');

    consumer
      .apply(requestLoggerFactory({
        headerFields,
        logRequestBody: logBody,
        ignorePaths,
      }))
      .forRoutes('*');
  }
}
```

### 🎯 Path Matching Patterns

The middleware supports multiple path matching strategies:

```typescript
app.use(requestLoggerFactory({
  ignorePaths: [
    // Exact substring match
    '/health',
    '/metrics',
    '/swagger',

    // Wildcard patterns (converted to regex)
    '/static/*',
    '/api/internal/*',
    '/uploads/*',

    // Complex regex patterns
    '/api/v[0-9]+/public',
    '/temp/.*\\.tmp',
  ],
}));
```

### 🔐 Advanced Security Configuration

Implement granular control over sensitive data:

```typescript
app.use(requestLoggerFactory({
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'x-auth-token',
    'x-custom-secret',
  ],
  sanitizeHeaders: (headers) => {
    const sanitized = { ...headers };

    // Partial masking for tokens
    if (sanitized['authorization']) {
      const auth = sanitized['authorization'];
      sanitized['authorization'] = typeof auth === 'string'
        ? `${auth.substring(0, 7)}...${auth.substring(auth.length - 10)}`
        : auth;
    }

    // Mask other sensitive headers completely
    ['cookie', 'x-api-key', 'x-auth-token'].forEach(key => {
      if (sanitized[key]) sanitized[key] = '*'.repeat(20);
    });

    return sanitized;
  },
}));
```

### 📈 Performance Monitoring

Combine with performance analysis:

```typescript
app.use(requestLoggerFactory({
  completedRequestMessage: (details) => {
    const duration = parseFloat(details.durationMs);
    let performanceLevel = '🟢';

    if (duration > 1000) performanceLevel = '🔴';
    else if (duration > 500) performanceLevel = '🟡';
    else if (duration > 100) performanceLevel = '🟡';

    return `${performanceLevel} ${details.method} ${details.url} - ${details.statusCode} in ${details.durationMs}ms`;
  },
}));
```

---

## 📋 Requirements

- **Node.js**: 14.0.0 or higher
- **NestJS**: 8.0.0 or higher
- **Express**: 4.0.0 or higher (for Express adapter)
- **Fastify**: 4.0.0 or 5.0.0 (for Fastify adapter)

## 🔄 Version Compatibility

| NestJS Version | Package Support |
|---|---|
| 8.x | ✅ Full Support |
| 9.x | ✅ Full Support |
| 10.x | ✅ Full Support |
| 11.x | ✅ Full Support |

---

## 🐛 Troubleshooting

### Headers not being logged

Ensure `headerFields` is set in your configuration:
```typescript
app.use(requestLoggerFactory({ headerFields: ['content-type', 'authorization'] }));
```

### Custom logger not being used

Make sure your custom logger implements the NestJS `LoggerService` interface:
```typescript
import { LoggerService } from '@nestjs/common';

export class MyLogger implements LoggerService {
  log(message: string) { /* ... */ }
  error(message: string, trace?: string) { /* ... */ }
  warn(message: string) { /* ... */ }
  debug(message: string) { /* ... */ }
  verbose(message: string) { /* ... */ }
}
```

### Performance impact on high-traffic applications

The middleware is optimized for production use. If you experience performance issues:
1. Use `ignorePaths` to exclude high-frequency endpoints (health checks, metrics)
2. Consider disabling `headerFields` and `logRequestBody` if not needed
3. Use an async logger that doesn't block the request

---

## 📝 API Reference

### `requestLoggerFactory(options?)`

Creates and returns an Express/Fastify compatible middleware function.

**Parameters:**
- `options` (optional): `Partial<RequestLoggerOptions>`

**Returns:** `(req: Req, res: Res, next: Function) => void`

**Example:**
```typescript
const middleware = requestLoggerFactory({ headerFields: ['content-type', 'authorization'] });
app.use(middleware);
```

### `createRequestLoggerProviders(options?)`

Creates NestJS providers for dependency injection.

**Parameters:**
- `options` (optional): `RequestLoggerModuleOptions`

**Returns:** `Provider[]`

### `createRequestLoggerAsyncProviders(options)`

Creates async NestJS providers for dynamic configuration.

**Parameters:**
- `options`: `RequestLoggerAsyncOptions` with `useFactory` and `inject`

**Returns:** `Provider[]`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/samofprog/nestjs-request-logger/issues)
- Check existing documentation and examples

---

## 📄 License

This package is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).

**Copyright (c) 2024 samofprog**

---

## 🙏 Acknowledgments

Built with ❤️ for the NestJS community. Special thanks to all contributors and users who have provided feedback and improvements.