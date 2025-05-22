import { HeaderFieldExtractor } from '../src';
import type { Headers } from '../src/types';

describe('HeaderFieldExtractor', () => {
    describe('constructor', () => {
        it('should initialize with no fields', () => {
            const extractor = new HeaderFieldExtractor([]);
            expect(extractor).toBeDefined();
        });

        it('should initialize with fields', () => {
            const extractor = new HeaderFieldExtractor([
                'content-type',
                'authorization',
            ]);
            expect(extractor).toBeDefined();
        });
    });

    describe('extraction with Go-style format', () => {
        let extractor: HeaderFieldExtractor;

        beforeEach(() => {
            extractor = new HeaderFieldExtractor([
                'content-type',
                'authorization',
                'x-api-key',
            ]);
        });

        it('should extract specified headers in Go-style format', () => {
            const headers = {
                'content-type': 'application/json',
                authorization: 'Bearer token',
                'x-api-key': 'secret',
                'user-agent': 'Mozilla/5.0',
                host: 'example.com',
            } as Headers;

            const result = extractor.extract(headers);

            expect(typeof result).toBe('string');
            expect(result).toContain('content-type=application/json');
            expect(result).toContain('authorization=Bearer token');
            expect(result).toContain('x-api-key=secret');
        });

        it('should not include non-specified headers', () => {
            const headers = {
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0',
                host: 'example.com',
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).not.toContain('user-agent');
            expect(result).not.toContain('host');
        });

        it('should return empty string when no headers match', () => {
            const headers = {
                'user-agent': 'Mozilla/5.0',
                host: 'example.com',
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).toBe('');
        });

        it('should return empty string when no fields specified', () => {
            const emptyExtractor = new HeaderFieldExtractor([]);
            const headers = {
                'content-type': 'application/json',
                authorization: 'Bearer token',
            } as Headers;

            const result = emptyExtractor.extract(headers);

            expect(result).toBe('');
        });
    });

    describe('case sensitivity', () => {
        it('should handle header names case-insensitively', () => {
            const extractor = new HeaderFieldExtractor(['content-type']);

            const headers = {
                'Content-Type': 'application/json',
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).toContain('Content-Type=application/json');
        });
    });

    describe('data types', () => {
        it('should handle string header values', () => {
            const extractor = new HeaderFieldExtractor(['content-type']);
            const headers = {
                'content-type': 'application/json',
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).toContain('content-type=application/json');
        });

        it('should handle numeric header values', () => {
            const extractor = new HeaderFieldExtractor(['content-length']);
            const headers = {
                'content-length': 2048,
            } as unknown as Headers;

            const result = extractor.extract(headers);

            expect(result).toContain('content-length=2048');
        });

        it('should handle array header values', () => {
            const extractor = new HeaderFieldExtractor(['set-cookie']);
            const headers = {
                'set-cookie': ['session=abc', 'userId=123'],
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).toContain('set-cookie=session=abc,userId=123');
        });
    });

    describe('special headers', () => {
        it('should extract common headers', () => {
            const commonHeaders = ['content-type', 'host', 'authorization'];

            const extractor = new HeaderFieldExtractor(commonHeaders);

            const headers = {
                'content-type': 'application/json',
                host: 'api.example.com',
                authorization: 'Bearer token',
                'user-agent': 'Node/18.0',
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).toContain('content-type=application/json');
            expect(result).toContain('host=api.example.com');
            expect(result).toContain('authorization=Bearer token');
            expect(result).not.toContain('user-agent');
        });

        it('should extract custom headers', () => {
            const customHeaders = ['x-api-key', 'x-request-id', 'x-trace-id'];

            const extractor = new HeaderFieldExtractor(customHeaders);

            const headers = {
                'x-api-key': 'key123',
                'x-request-id': 'req-abc',
                'x-trace-id': 'trace-xyz',
            } as Headers;

            const result = extractor.extract(headers);

            expect(result).toContain('x-api-key=key123');
            expect(result).toContain('x-request-id=req-abc');
            expect(result).toContain('x-trace-id=trace-xyz');
        });
    });

    describe('output format', () => {
        it('should have leading space when fields extracted', () => {
            const extractor = new HeaderFieldExtractor(['content-type']);
            const headers = { 'content-type': 'application/json' } as Headers;

            const result = extractor.extract(headers);

            expect(result.startsWith(' ')).toBe(true);
        });

        it('should separate multiple fields with space', () => {
            const extractor = new HeaderFieldExtractor([
                'content-type',
                'authorization',
            ]);
            const headers = {
                'content-type': 'application/json',
                authorization: 'Bearer token',
            } as Headers;

            const result = extractor.extract(headers);

            const parts = result.trim().split(' ');
            expect(parts.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('non-mutating', () => {
        it('should not mutate original headers', () => {
            const extractor = new HeaderFieldExtractor(['content-type']);

            const headers = {
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0',
            };

            const originalKeys = Object.keys(headers);

            extractor.extract(headers);

            expect(Object.keys(headers)).toEqual(originalKeys);
        });
    });
});
