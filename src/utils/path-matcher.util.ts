/**
 * @file Path Matcher Utility Class
 * @description Matches URLs against path patterns (strings and regex)
 * @author samofprog
 * @license MIT
 */

/**
 * Utility class for matching URLs against path patterns.
 *
 * Purpose:
 * - Match URLs against multiple path patterns
 * - Support both string patterns (for exact/substring matching) and regex patterns
 * - Handle wildcard patterns (e.g., /static/*)
 * - Pre-compile patterns for better performance
 *
 * @class PathMatcher
 *
 * @example
 * ```typescript
 * import { PathMatcher } from '@samofprog/nestjs-request-logger/utils';
 *
 * const matcher = new PathMatcher([
 *   '/health',
 *   '/metrics',
 *   '/static/*'
 * ]);
 *
 * matcher.matches('/health');      // true
 * matcher.matches('/static/js/app.js');  // true
 * matcher.matches('/api/users');   // false
 * ```
 */
export class PathMatcher {
    private patterns: RegExp[];

    /**
     * Create a new PathMatcher instance
     *
     * @param {string[]} ignorePaths - Array of path patterns to match
     *                                  Supports wildcards: /static/*
     */
    constructor(ignorePaths: string[] = []) {
        this.patterns = ignorePaths.map((path) => {
            if (this.needsRegex(path)) {
                // Convert wildcard patterns to regex: /static/* → /static/.*
                // Using split/join for ES6 compatibility (avoids replaceAll requirement)
                const regexPattern = path.split('*').join('.*');
                return new RegExp(`^${regexPattern}$`);
            }
            // Convert exact string patterns to regex for exact matching
            const regexPattern = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`^${regexPattern}$`);
        });
    }

    /**
     * Check if a path matches any of the configured patterns
     *
     * @param {string} path - The path to check (with or without query string)
     * @returns {boolean} True if the path matches any pattern
     *
     * @example
     * ```typescript
     * matcher.matches('/api/users');           // tests against pattern
     * matcher.matches('/api/users?role=admin'); // also tests against pattern (query string stripped)
     * ```
     */
    matches(path: string): boolean {
        // Extract path before query string to match against patterns
        const pathOnly = path.split('?')[0];
        return this.patterns.some((pattern) => pattern.test(pathOnly));
    }

    /**
     * Check if a path needs to be converted to regex
     * (contains wildcards or other regex indicators)
     *
     * @private
     * @param {string} path - The path to check
     * @returns {boolean} True if regex is needed
     */
    private needsRegex(path: string): boolean {
        return path.includes('*') || path.includes('[') || path.includes('(');
    }
}
