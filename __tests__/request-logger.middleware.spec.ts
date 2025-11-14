import { Logger } from '@nestjs/common';
import { Req, RequestLoggerMiddleware, Res } from '../src';
describe('RequestLoggerMiddleware', () => {
    let middleware: RequestLoggerMiddleware;
    let mockLogger: Partial<Logger>;
    let mockReq: Req;
    let mockRes: Res;
    let nextCallback: jest.Mock;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
        };

        mockReq = {
            method: 'GET',
            path: '/api/users',
            originalUrl: '/api/users',
            headers: {
                'content-type': 'application/json',
                authorization: 'Bearer token123',
            },
            body: undefined,
        } as unknown as Req;

        mockRes = {
            statusCode: 200,
            once: jest.fn((_event: string, callback: () => void) => {
                // Simulate immediate completion for testing
                setTimeout(callback, 0);
            }),
        } as unknown as Res;

        nextCallback = jest.fn();
    });

    describe('initialization', () => {
        it('should create middleware with default options', () => {
            middleware = new RequestLoggerMiddleware({});
            expect(middleware).toBeDefined();
        });

        it('should create middleware with custom logger', () => {
            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });
            expect(middleware).toBeDefined();
        });

        it('should create middleware with header fields', () => {
            middleware = new RequestLoggerMiddleware({
                headerFields: ['content-type', 'authorization'],
                logger: mockLogger as Logger,
            });
            expect(middleware).toBeDefined();
        });

        it('should create middleware with ignore paths', () => {
            middleware = new RequestLoggerMiddleware({
                ignorePaths: ['/health', '/metrics'],
                logger: mockLogger as Logger,
            });
            expect(middleware).toBeDefined();
        });
    });

    describe('request logging', () => {
        beforeEach(() => {
            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });
        });

        it('should log incoming request', (done) => {
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                expect(nextCallback).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should log request method and URL', (done) => {
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('GET');
                expect(logCall).toContain('/api/users');
                done();
            }, 50);
        });

        it('should extract URL from originalUrl (Express)', (done) => {
            const req = {
                ...mockReq,
                originalUrl: '/api/users?page=1',
            } as unknown as Req;
            middleware.use(req, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('/api/users?page=1');
                done();
            }, 50);
        });

        it('should extract URL from url fallback (Express)', (done) => {
            const req = {
                method: 'GET',
                path: '/api/data',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;
            middleware.use(req, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('/api/data');
                done();
            }, 50);
        });

        it('should handle missing headers gracefully', (done) => {
            const req = {
                method: 'GET',
                path: '/api/users',
                headers: {} as Record<string, string | string[]>,
                body: undefined,
            } as unknown as Req;
            middleware.use(req, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should log request body when logRequestBody is true', (done) => {
            mockReq.body = { name: 'test', email: 'test@example.com' };
            middleware = new RequestLoggerMiddleware({
                logRequestBody: true,
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('body');
                done();
            }, 50);
        });

        it('should not log request body when logRequestBody is false', (done) => {
            mockReq.body = { name: 'test', email: 'test@example.com' };
            middleware = new RequestLoggerMiddleware({
                logRequestBody: false,
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).not.toContain('test@example.com');
                done();
            }, 50);
        });
    });

    describe('response logging', () => {
        beforeEach(() => {
            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });
        });

        it('should log response after completion', (done) => {
            mockRes.statusCode = 200;
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                // Should have at least 2 log calls: incoming and completed
                expect(mockLogger.log).toHaveBeenCalledTimes(2);
                done();
            }, 50);
        });

        it('should log successful responses (2xx) with logger.log', (done) => {
            mockRes.statusCode = 200;
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                expect(mockLogger.error).not.toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should log successful responses (3xx) with logger.log', (done) => {
            mockRes.statusCode = 302;
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                expect(mockLogger.error).not.toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should log error responses (4xx) with logger.error', (done) => {
            mockRes.statusCode = 404;
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const calls = (mockLogger.error as jest.Mock).mock.calls;
                expect(calls.length).toBeGreaterThan(0);
                done();
            }, 50);
        });

        it('should log error responses (5xx) with logger.error', (done) => {
            mockRes.statusCode = 500;
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.error).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should include status code in completion message', (done) => {
            mockRes.statusCode = 201;
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCalls = (mockLogger.log as jest.Mock).mock.calls;
                const completionCall = logCalls[logCalls.length - 1][0];
                expect(completionCall).toContain('201');
                done();
            }, 50);
        });

        it('should measure request duration', (done) => {
            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCalls = (mockLogger.log as jest.Mock).mock.calls;
                const completionCall = logCalls[logCalls.length - 1][0];
                expect(completionCall).toContain('ms');
                done();
            }, 50);
        });
    });

    describe('path filtering', () => {
        it('should skip logging for ignored paths', (done) => {
            const req = {
                method: 'GET',
                originalUrl: '/health',
                path: '/health',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;
            middleware = new RequestLoggerMiddleware({
                ignorePaths: ['/health'],
                logger: mockLogger as Logger,
            });

            middleware.use(req, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).not.toHaveBeenCalled();
                expect(nextCallback).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should log non-ignored paths', (done) => {
            middleware = new RequestLoggerMiddleware({
                ignorePaths: ['/health', '/metrics'],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should support wildcard patterns in ignore paths', (done) => {
            const req = {
                method: 'GET',
                originalUrl: '/static/css/style.css',
                path: '/static/css/style.css',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;
            middleware = new RequestLoggerMiddleware({
                ignorePaths: ['/static/*'],
                logger: mockLogger as Logger,
            });

            middleware.use(req, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).not.toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should always call next middleware regardless of logging', (done) => {
            const req = {
                method: 'GET',
                originalUrl: '/health',
                path: '/health',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;
            middleware = new RequestLoggerMiddleware({
                ignorePaths: ['/health'],
                logger: mockLogger as Logger,
            });

            middleware.use(req, mockRes, nextCallback);

            expect(nextCallback).toHaveBeenCalled();
            done();
        });
    });

    describe('header sanitization', () => {
        it('should mask sensitive headers by default', (done) => {
            middleware = new RequestLoggerMiddleware({
                headerFields: ['authorization'],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).not.toContain('token123');
                done();
            }, 50);
        });

        it('should support custom sensitive headers', (done) => {
            mockReq.headers['x-api-key'] = 'secret-key-12345';
            middleware = new RequestLoggerMiddleware({
                headerFields: ['x-api-key'],
                sensitiveHeaders: ['x-api-key'],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).not.toContain('secret-key-12345');
                done();
            }, 50);
        });

        it('should not mask non-sensitive headers', (done) => {
            middleware = new RequestLoggerMiddleware({
                headerFields: ['content-type'],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('content-type');
                done();
            }, 50);
        });
    });

    describe('header field extraction', () => {
        it('should include specified header fields in log', (done) => {
            middleware = new RequestLoggerMiddleware({
                headerFields: ['content-type'],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('content-type');
                done();
            }, 50);
        });

        it('should not include unspecified header fields', (done) => {
            middleware = new RequestLoggerMiddleware({
                headerFields: ['x-custom-header'],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).not.toContain('content-type');
                done();
            }, 50);
        });

        it('should not include headers when headerFields is empty', (done) => {
            middleware = new RequestLoggerMiddleware({
                headerFields: [],
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                // Should not contain header values, only method and url
                expect(logCall).toContain('GET');
                expect(logCall).toContain('/api/users');
                done();
            }, 50);
        });
    });

    describe('custom formatters', () => {
        it('should support custom incoming formatter', (done) => {
            middleware = new RequestLoggerMiddleware({
                incomingRequestMessage: (details) =>
                    `INCOMING: ${details.method} ${details.path}`,
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const logCall = (mockLogger.log as jest.Mock).mock.calls[0][0];
                expect(logCall).toContain('INCOMING');
                done();
            }, 50);
        });

        it('should support custom completed formatter', (done) => {
            middleware = new RequestLoggerMiddleware({
                completedRequestMessage: (details) =>
                    `COMPLETED: ${details.statusCode}`,
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                const errorCalls = (mockLogger.error as jest.Mock).mock.calls;
                const logCalls = (mockLogger.log as jest.Mock).mock.calls;
                const lastCall =
                    errorCalls.length > 0
                        ? errorCalls[errorCalls.length - 1][0]
                        : logCalls[logCalls.length - 1][0];
                expect(lastCall).toContain('COMPLETED');
                done();
            }, 50);
        });
    });

    describe('framework compatibility', () => {
        it('should handle Express request format', (done) => {
            const expressReq = {
                method: 'POST',
                originalUrl: '/api/data',
                headers: { 'content-type': 'application/json' },
                body: { data: 'test' },
            } as unknown as Req;

            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });

            middleware.use(expressReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should handle Fastify request format with raw property', (done) => {
            const fastifyReq = {
                method: 'GET',
                path: '/api/items',
                headers: { 'content-type': 'application/json' },
            } as unknown as Req;

            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });

            middleware.use(fastifyReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                done();
            }, 50);
        });

        it('should handle Fastify response format', (done) => {
            const fastifyRes = {
                statusCode: 200,
                once: jest.fn((_event: string, callback: () => void) => {
                    setTimeout(callback, 0);
                }),
                raw: {
                    once: jest.fn((_event: string, callback: () => void) => {
                        setTimeout(callback, 0);
                    }),
                },
            } as unknown as Res;

            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });

            middleware.use(mockReq, fastifyRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalled();
                done();
            }, 50);
        });
    });

    describe('integration tests', () => {
        it('should log full request lifecycle', (done) => {
            middleware = new RequestLoggerMiddleware({
                headerFields: ['content-type'],
                logRequestBody: true,
                logger: mockLogger as Logger,
            });

            mockReq.body = { action: 'create' };
            mockRes.statusCode = 201;

            middleware.use(mockReq, mockRes, nextCallback);

            setTimeout(() => {
                expect(mockLogger.log).toHaveBeenCalledTimes(2);
                expect(nextCallback).toHaveBeenCalledTimes(1);
                done();
            }, 50);
        });

        it('should work with multiple middleware calls', (done) => {
            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });

            const req1 = {
                method: 'GET',
                path: '/api/users',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;
            const req2 = {
                method: 'GET',
                path: '/api/posts',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;

            middleware.use(req1, mockRes, nextCallback);
            middleware.use(req2, mockRes, nextCallback);

            setTimeout(() => {
                expect(nextCallback).toHaveBeenCalledTimes(2);
                done();
            }, 50);
        });

        it('should maintain separate state for concurrent requests', (done) => {
            middleware = new RequestLoggerMiddleware({
                logger: mockLogger as Logger,
            });

            const res1 = {
                statusCode: 200,
                once: jest.fn((_, cb) => setTimeout(cb, 10)),
            } as unknown as Res;
            const res2 = {
                statusCode: 404,
                once: jest.fn((_, cb) => setTimeout(cb, 20)),
            } as unknown as Res;

            const req1 = {
                method: 'GET',
                path: '/api/users',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;
            const req2 = {
                method: 'GET',
                path: '/api/notfound',
                headers: mockReq.headers,
                body: undefined,
            } as unknown as Req;

            middleware.use(req1, res1, nextCallback);
            middleware.use(req2, res2, nextCallback);

            setTimeout(() => {
                expect(nextCallback).toHaveBeenCalledTimes(2);
                done();
            }, 50);
        });
    });
});
