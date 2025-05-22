/**
 * @file Default Sensitive Headers
 * @description List of headers that contain sensitive information and should be masked
 * @author samofprog
 * @license MIT
 */

/**
 * Default list of sensitive headers that should be masked during logging.
 * These headers typically contain authentication tokens, session cookies, or API keys.
 *
 * @constant DEFAULT_SENSITIVE_HEADERS
 *
 * Headers included:
 * - authorization: Bearer tokens, API keys
 * - cookie: Session cookies
 * - set-cookie: Response cookies with session data
 * - x-api-key: Custom API key headers
 *
 * @example
 * ```typescript
 * import { DEFAULT_SENSITIVE_HEADERS } from '@samofprog/nestjs-request-logger';
 *
 * const customHeaders = [
 *   ...DEFAULT_SENSITIVE_HEADERS,
 *   'x-custom-token',
 *   'x-auth-secret'
 * ];
 * ```
 */
export const DEFAULT_SENSITIVE_HEADERS = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
] as const;
