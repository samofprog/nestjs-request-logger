/**
 * @file Nested Extractor Utility Class
 * @description Extracts nested object properties using dot notation
 * @author samofprog
 * @license MIT
 */

/**
 * Utility class for extracting nested values from objects using dot notation.
 *
 * Purpose:
 * - Safely traverse nested objects
 * - Handle undefined/null values gracefully
 * - Support deep property access with dot notation
 *
 * @class NestedExtractor
 *
 * @example
 * ```typescript
 * import { NestedExtractor } from '@samofprog/nestjs-request-logger/utils';
 *
 * const extractor = new NestedExtractor();
 * const obj = {
 *   user: {
 *     permissions: {
 *       admin: true
 *     }
 *   }
 * };
 *
 * const value = extractor.extract(obj, 'user.permissions.admin');
 * // Result: true
 * ```
 */
export class NestedExtractor {
    /**
     * Extract a nested value from an object using dot notation
     *
     * @param {Record<string, unknown>} obj - The object to extract from
     * @param {string} path - The dot notation path (e.g., 'user.permissions.admin')
     * @returns {unknown} The value at the path, or undefined if not found
     */
    extract(obj: Record<string, unknown>, path: string): unknown {
        const parts = path.split('.');
        let current: unknown = obj;

        for (const part of parts) {
            if (current == null) return undefined;
            if (typeof current !== 'object') return undefined;
            current = (current as Record<string, unknown>)[part];
        }

        return current;
    }
}
