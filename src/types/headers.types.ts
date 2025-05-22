/**
 * @file Headers Type Definition
 * @description HTTP headers type definition
 * @author samofprog
 * @license MIT
 */

/**
 * HTTP headers type definition.
 * Represents header key-value pairs where values can be strings or arrays of strings.
 *
 * @example
 * ```typescript
 * const headers: Headers = {
 *   'content-type': 'application/json',
 *   'accept-language': ['en-US', 'en'],
 *   'authorization': 'Bearer token123'
 * };
 * ```
 */
export type Headers = Record<string, unknown>;
