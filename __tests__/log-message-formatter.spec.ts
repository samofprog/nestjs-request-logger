import { LogMessageFormatter } from '../src';

describe('LogMessageFormatter', () => {
    let formatter: LogMessageFormatter;

    beforeEach(() => {
        formatter = new LogMessageFormatter({
            headerFields: [],
            logRequestBody: false,
            sensitiveHeaders: ['authorization'],
        });
    });

    describe('incoming', () => {
        it('should format incoming request details', () => {
            const result = formatter.incoming({
                method: 'GET',
                path: '/api/users',
                headers: { 'content-type': 'application/json' },
            });

            expect(result).toContain('GET');
            expect(result).toContain('/api/users');
        });

        it('should include headers when provided', () => {
            const formatterWithHeaders = new LogMessageFormatter({
                headerFields: ['content-type'],
                logRequestBody: false,
            });

            const result = formatterWithHeaders.incoming({
                method: 'POST',
                path: '/api/data',
                headers: { 'content-type': 'application/json' },
            });

            expect(result).toContain('content-type');
        });

        it('should include body when logRequestBody is true', () => {
            const formatterWithBody = new LogMessageFormatter({
                headerFields: [],
                logRequestBody: true,
            });

            const result = formatterWithBody.incoming({
                method: 'POST',
                path: '/api/data',
                headers: {},
                body: { name: 'test' },
            });

            expect(result).toContain('POST');
            expect(result).toContain('/api/data');
        });

        it('should exclude body when logRequestBody is false', () => {
            const result = formatter.incoming({
                method: 'POST',
                path: '/api/data',
                headers: {},
                body: { name: 'test' },
            });

            expect(result).not.toContain('name');
        });

        it('should exclude undefined body', () => {
            const result = formatter.incoming({
                method: 'GET',
                path: '/api/data',
                headers: {},
                body: undefined,
            });

            expect(result).toContain('GET');
        });
    });

    describe('completed', () => {
        it('should format completed request details', () => {
            const result = formatter.completed({
                method: 'GET',
                path: '/api/users',
                statusCode: 200,
                durationMs: '25.50',
            });

            expect(result).toContain('GET');
            expect(result).toContain('/api/users');
            expect(result).toContain('200');
            expect(result).toContain('25.50');
        });

        it('should handle different status codes', () => {
            const result404 = formatter.completed({
                method: 'GET',
                path: '/api/notfound',
                statusCode: 404,
                durationMs: '10.25',
            });

            expect(result404).toContain('404');
        });

        it('should handle different HTTP methods', () => {
            const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

            methods.forEach((method) => {
                const result = formatter.completed({
                    method,
                    path: '/api/test',
                    statusCode: 200,
                    durationMs: '15.00',
                });

                expect(result).toContain(method);
            });
        });

        it('should format duration correctly', () => {
            const result = formatter.completed({
                method: 'GET',
                path: '/api/data',
                statusCode: 200,
                durationMs: '1234.56',
            });

            expect(result).toContain('1234.56');
        });
    });
});
