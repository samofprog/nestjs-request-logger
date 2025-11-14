import { HeaderSanitizer } from '../src';

describe('HeaderSanitizer', () => {
    describe('default sensitive headers', () => {
        let sanitizer: HeaderSanitizer;

        beforeEach(() => {
            sanitizer = new HeaderSanitizer();
        });

        it('should mask authorization header', () => {
            const headers = {
                authorization: 'Bearer token123',
                'content-type': 'application/json',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized.authorization).toBe('[REDACTED]');
            expect(sanitized['content-type']).toBe('application/json');
        });

        it('should mask cookie header', () => {
            const headers = {
                cookie: 'session=abc123',
                host: 'example.com',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized.cookie).toBe('[REDACTED]');
            expect(sanitized.host).toBe('example.com');
        });

        it('should mask set-cookie header', () => {
            const headers = {
                'set-cookie': 'sessionId=xyz789',
                'cache-control': 'no-cache',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized['set-cookie']).toBe('[REDACTED]');
            expect(sanitized['cache-control']).toBe('no-cache');
        });

        it('should mask x-api-key header', () => {
            const headers = {
                'x-api-key': 'secret-key-12345',
                'user-agent': 'Mozilla/5.0',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized['x-api-key']).toBe('[REDACTED]');
            expect(sanitized['user-agent']).toBe('Mozilla/5.0');
        });

        it('should handle case-insensitive header names', () => {
            const headers = {
                AUTHORIZATION: 'Bearer token',
                Authorization: 'Bearer token2',
                'content-type': 'application/json',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized.AUTHORIZATION).toBe('[REDACTED]');
            expect(sanitized.Authorization).toBe('[REDACTED]');
            expect(sanitized['content-type']).toBe('application/json');
        });

        it('should handle empty headers object', () => {
            const headers = {};

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized).toEqual({});
        });

        it('should return new object without mutating original', () => {
            const headers = {
                authorization: 'Bearer token',
                'content-type': 'application/json',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(headers.authorization).toBe('Bearer token');
            expect(sanitized.authorization).toBe('[REDACTED]');
        });
    });

    describe('custom sensitive headers', () => {
        it('should accept custom sensitive headers', () => {
            const sanitizer = new HeaderSanitizer([
                'x-custom-token',
                'x-api-secret',
            ]);

            const headers = {
                'x-custom-token': 'secret123',
                'x-api-secret': 'secret456',
                'content-type': 'application/json',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized['x-custom-token']).toBe('[REDACTED]');
            expect(sanitized['x-api-secret']).toBe('[REDACTED]');
            expect(sanitized['content-type']).toBe('application/json');
        });

        it('should override default sensitive headers when custom provided', () => {
            const sanitizer = new HeaderSanitizer(['x-custom-token']);

            const headers = {
                authorization: 'Bearer token',
                'x-custom-token': 'secret123',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized.authorization).toBe('Bearer token');
            expect(sanitized['x-custom-token']).toBe('[REDACTED]');
        });
    });

    describe('edge cases', () => {
        let sanitizer: HeaderSanitizer;

        beforeEach(() => {
            sanitizer = new HeaderSanitizer();
        });

        it('should handle null or undefined header values', () => {
            const headers = {
                authorization: null,
                'x-api-key': undefined,
                'content-type': 'application/json',
            };

            const sanitized = sanitizer.sanitize(
                headers as unknown as Record<string, unknown>
            );

            expect(sanitized['content-type']).toBe('application/json');
        });

        it('should handle empty string header values', () => {
            const headers = {
                authorization: '',
                'content-type': 'application/json',
            };

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized.authorization).toBe('[REDACTED]');
            expect(sanitized['content-type']).toBe('application/json');
        });

        it('should handle numeric header values', () => {
            const headers = {
                'content-length': 1024,
                authorization: 'Bearer token',
            } as unknown as Record<string, unknown>;

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized['content-length']).toBe(1024);
            expect(sanitized.authorization).toBe('[REDACTED]');
        });

        it('should handle array header values', () => {
            const headers = {
                'set-cookie': ['sessionId=abc', 'userId=123'],
                'content-type': 'application/json',
            } as unknown as Record<string, unknown>;

            const sanitized = sanitizer.sanitize(headers);

            expect(sanitized['set-cookie']).toBe('[REDACTED]');
            expect(sanitized['content-type']).toBe('application/json');
        });
    });
});
