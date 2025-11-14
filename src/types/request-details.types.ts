/**
 * @file Request Details Type Definition
 * @description Type for request details captured by the logger
 * @author samofprog
 * @license MIT
 */

import { Headers } from './headers.types';

/**
 * Details of an incoming HTTP request for logging purposes.
 *
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @property {string} path - Request path (with query string if present)
 * @property {Headers} headers - Request headers (typically sanitized)
 * @property {unknown} [body] - Optional request body payload
 *
 * @example
 * ```typescript
 * const details: RequestDetails = {
 *   method: 'POST',
 *   path: '/api/users?role=admin',
 *   headers: { authorization: '*****', 'content-type': 'application/json' },
 *   body: { name: 'John', email: 'john@example.com' }
 * };
 * ```
 */
export interface RequestDetails {
    method: string;
    path: string;
    headers: Headers;
    body?: unknown;
}
