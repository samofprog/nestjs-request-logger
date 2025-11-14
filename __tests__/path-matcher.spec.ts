import { PathMatcher } from '../src';

describe('PathMatcher', () => {
    describe('exact matching', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher(['/health', '/metrics', '/status']);
        });

        it('should match exact paths', () => {
            expect(matcher.matches('/health')).toBe(true);
            expect(matcher.matches('/metrics')).toBe(true);
            expect(matcher.matches('/status')).toBe(true);
        });

        it('should not match similar paths', () => {
            expect(matcher.matches('/healthy')).toBe(false);
            expect(matcher.matches('/health-check')).toBe(false);
            expect(matcher.matches('/metrics-data')).toBe(false);
        });

        it('should handle case-sensitive matching by default', () => {
            expect(matcher.matches('/HEALTH')).toBe(false);
            expect(matcher.matches('/Health')).toBe(false);
        });

        it('should not match if no patterns provided', () => {
            const emptyMatcher = new PathMatcher([]);

            expect(emptyMatcher.matches('/any-path')).toBe(false);
            expect(emptyMatcher.matches('/health')).toBe(false);
        });
    });

    describe('wildcard matching', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher([
                '/static/*',
                '/assets/*',
                '/api/v*/public',
            ]);
        });

        it('should match wildcard patterns', () => {
            expect(matcher.matches('/static/css')).toBe(true);
            expect(matcher.matches('/static/js')).toBe(true);
            expect(matcher.matches('/static/images/logo.png')).toBe(true);
        });

        it('should match version patterns', () => {
            expect(matcher.matches('/api/v1/public')).toBe(true);
            expect(matcher.matches('/api/v2/public')).toBe(true);
            expect(matcher.matches('/api/v3/public')).toBe(true);
        });

        it('should not match if pattern does not match', () => {
            expect(matcher.matches('/static')).toBe(false);
            expect(matcher.matches('/dynamic/css')).toBe(false);
            expect(matcher.matches('/api/v1/private')).toBe(false);
        });

        it('should handle multiple wildcards', () => {
            const multiMatcher = new PathMatcher(['/*/*.png', '/*/*/*.js']);

            expect(multiMatcher.matches('/images/logo.png')).toBe(true);
            expect(multiMatcher.matches('/src/lib/utils.js')).toBe(true);
            expect(multiMatcher.matches('/users')).toBe(false);
        });
    });

    describe('regex matching', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher([
                '/temp/.*\\.tmp',
                '^/api/[0-9]+/data$',
                '/uploads/.*',
            ]);
        });

        it('should match regex patterns', () => {
            expect(matcher.matches('/temp/session.tmp')).toBe(true);
            expect(matcher.matches('/temp/file123.tmp')).toBe(true);
        });

        it('should match numeric patterns', () => {
            expect(matcher.matches('/api/123/data')).toBe(true);
            expect(matcher.matches('/api/456/data')).toBe(true);
        });

        it('should not match if regex pattern does not match', () => {
            expect(matcher.matches('/temp/file.txt')).toBe(false);
            expect(matcher.matches('/api/abc/data')).toBe(false);
        });

        it('should match upload patterns', () => {
            expect(matcher.matches('/uploads/file.pdf')).toBe(true);
            expect(matcher.matches('/uploads/folder/doc.docx')).toBe(true);
        });
    });

    describe('mixed patterns', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher([
                '/health', // exact
                '/static/*', // wildcard
                '/api/[0-9]+/public', // regex
            ]);
        });

        it('should handle mixed pattern types', () => {
            expect(matcher.matches('/health')).toBe(true);
            expect(matcher.matches('/static/css')).toBe(true);
            expect(matcher.matches('/api/123/public')).toBe(true);
        });

        it('should not match unrelated paths', () => {
            expect(matcher.matches('/api/public')).toBe(false);
            expect(matcher.matches('/dynamic/css')).toBe(false);
            expect(matcher.matches('/status')).toBe(false);
        });
    });

    describe('special characters', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher([
                '/api-v1/data',
                '/download_file',
                '/path.with.dots',
            ]);
        });

        it('should handle paths with dashes', () => {
            expect(matcher.matches('/api-v1/data')).toBe(true);
        });

        it('should handle paths with underscores', () => {
            expect(matcher.matches('/download_file')).toBe(true);
        });

        it('should handle paths with dots', () => {
            expect(matcher.matches('/path.with.dots')).toBe(true);
        });
    });

    describe('root path', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher(['/']);
        });

        it('should match root path', () => {
            expect(matcher.matches('/')).toBe(true);
        });

        it('should not match other paths', () => {
            expect(matcher.matches('/api')).toBe(false);
        });
    });

    describe('query string handling', () => {
        let matcher: PathMatcher;

        beforeEach(() => {
            matcher = new PathMatcher(['/api/users', '/health', '/static/*']);
        });

        it('should match paths with query strings', () => {
            expect(matcher.matches('/api/users?role=admin')).toBe(true);
            expect(matcher.matches('/api/users?id=123&name=test')).toBe(true);
            expect(matcher.matches('/health?check=true')).toBe(true);
        });

        it('should match wildcard patterns with query strings', () => {
            expect(matcher.matches('/static/css?v=1.0.0')).toBe(true);
            expect(matcher.matches('/static/js/app.js?cache=false')).toBe(true);
        });

        it('should not match non-matching paths with query strings', () => {
            expect(matcher.matches('/api/posts?id=1')).toBe(false);
            expect(matcher.matches('/status?check=true')).toBe(false);
        });

        it('should handle complex query strings', () => {
            expect(
                matcher.matches(
                    '/api/users?role=admin&department=engineering&sort=name'
                )
            ).toBe(true);
        });
    });

    describe('performance', () => {
        it('should handle large number of patterns', () => {
            const patterns = Array.from(
                { length: 1000 },
                (_, i) => `/path${i}`
            );
            const matcher = new PathMatcher(patterns);

            expect(matcher.matches('/path500')).toBe(true);
            expect(matcher.matches('/path999')).toBe(true);
            expect(matcher.matches('/path1000')).toBe(false);
        });
    });
});
