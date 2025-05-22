/**
 * @file Path Pattern Type Definition
 * @description Type for URL/path matching patterns
 * @author samofprog
 * @license MIT
 */

/**
 * Path pattern type for URL matching.
 * Supports both exact string matching and regex patterns.
 *
 * Examples:
 * - string: '/health' matches any URL containing '/health'
 * - RegExp: for complex pattern matching like API version patterns
 *
 * @example
 * ```typescript
 * const patterns: PathPattern[] = [
 *   '/health',           // String: exact substring match
 *   '/static/*',         // String with wildcard
 *   /^\/api\/v\d+\//    // RegExp: complex pattern
 * ];
 * ```
 */
export type PathPattern = string | RegExp;
