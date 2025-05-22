/**
 * @file Path Matcher Types
 * @description Type definitions for path pattern matching
 * @author samofprog
 * @license MIT
 */

/**
 * Function signature for path matching
 * Takes a URL and returns true if it matches any of the configured patterns
 */
export type PathMatcherFunction = (url: string) => boolean;
