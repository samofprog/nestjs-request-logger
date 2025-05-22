/**
 * @file Response Details Type Definition
 * @description Type for completed request details captured by the logger
 * @author samofprog
 * @license MIT
 */

/**
 * Details of a completed HTTP request for logging purposes.
 *
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @property {string} path - Request path (with query string if present)
 * @property {number} statusCode - HTTP response status code
 * @property {string} durationMs - Request duration in milliseconds (fixed to 2 decimal places)
 * @property {unknown} [responseData] - Optional response payload (for future use)
 *
 * @example
 * ```typescript
 * const details: CompletedRequestDetails = {
 *   method: 'POST',
 *   path: '/api/users?role=admin',
 *   statusCode: 201,
 *   durationMs: '45.23',
 *   responseData: { id: 1, name: 'John' }
 * };
 * ```
 */
export interface CompletedRequestDetails {
    method: string;
    path: string;
    statusCode: number;
    durationMs: string;
    responseData?: unknown;
}
