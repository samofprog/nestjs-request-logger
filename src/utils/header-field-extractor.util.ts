/**
 * @file Header Field Extractor Utility Class
 * @description Extracts and formats specific header fields in Go-style format
 * @author samofprog
 * @license MIT
 */

import { Headers } from '../types';

/**
 * Utility class for extracting specific header fields from headers object.
 *
 * Purpose:
 * - Extract only specified header fields from headers object
 * - Support nested property access using dot notation
 * - Format output in Go-style key=value format
 * - Handle various value types (strings, arrays, undefined)
 *
 * @class HeaderFieldExtractor
 *
 * @example
 * ```typescript
 * import { HeaderFieldExtractor } from '@samofprog/nestjs-request-logger/utils';
 *
 * const extractor = new HeaderFieldExtractor(['content-type', 'x-custom-header']);
 * const headers = {
 *   'content-type': 'application/json',
 *   'x-custom-header': 'value',
 *   'authorization': 'Bearer token'
 * };
 *
 * const result = extractor.extract(headers);
 * // Result: " content-type=application/json x-custom-header=value"
 * ```
 *
 * @example
 * ```typescript
 * // With nested properties
 * const extractor = new HeaderFieldExtractor(['user.permissions.admin']);
 * const headers = {
 *   'user': {
 *     'permissions': {
 *       'admin': true
 *     }
 *   }
 * };
 *
 * const result = extractor.extract(headers);
 * // Result: " user.permissions.admin=true"
 * ```
 */
export class HeaderFieldExtractor {
    private readonly headerFields: string[];

    /**
     * Create a new HeaderFieldExtractor instance
     *
     * @param {string[]} headerFields - Header field paths to extract (supports dot notation)
     */
    constructor(headerFields: string[] = []) {
        this.headerFields = headerFields;
    }

    /**
     * Extract specified header fields and format in Go-style key=value format
     *
     * @param {Headers} headers - Headers object to extract from
     * @returns {string} Formatted header fields string (empty string if no matches)
     */
    extract(headers: Headers): string {
        if (this.headerFields.length === 0) {
            return '';
        }

        const parts: string[] = [];

        for (const fieldPath of this.headerFields) {
            const lowerFieldPath = fieldPath.toLowerCase();

            for (const [key, value] of Object.entries(headers)) {
                // Check for exact match (simple header without dots)
                if (
                    key.toLowerCase() === lowerFieldPath &&
                    !this.isNestedPath(fieldPath)
                ) {
                    parts.push(`${key}=${this.formatValue(value)}`);
                    break;
                }

                // Check for nested access (e.g., header.nested.path)
                if (
                    this.isNestedPath(fieldPath) &&
                    typeof value === 'object' &&
                    value !== null
                ) {
                    const nestedValue = this.getNestedValue(
                        value as Record<string, unknown>,
                        fieldPath
                    );
                    if (nestedValue !== undefined) {
                        parts.push(`${fieldPath}=${nestedValue}`);
                        break;
                    }
                }
            }
        }

        return parts.length > 0 ? ` ${parts.join(' ')}` : '';
    }

    /**
     * Get a nested value from an object using dot notation
     *
     * @private
     * @param {Record<string, unknown>} obj - The object to traverse
     * @param {string} path - The dot notation path (e.g., 'user.permissions.admin')
     * @returns {unknown} The value at the path, or undefined if not found
     */
    private getNestedValue(
        obj: Record<string, unknown>,
        path: string
    ): unknown {
        const parts = path.split('.');
        let current: unknown = obj;

        for (const part of parts) {
            if (current == null) return undefined;
            if (typeof current !== 'object') return undefined;
            current = (current as Record<string, unknown>)[part];
        }

        return current;
    }

    /**
     * Format a header value as string (handles arrays and null)
     *
     * @private
     * @param {unknown} value - The value to format
     * @returns {string} Formatted string representation
     */
    private formatValue(value: unknown): string {
        return Array.isArray(value) ? value.join(',') : String(value);
    }

    /**
     * Check if a path contains nested property access (contains dots)
     *
     * @private
     * @param {string} path - The path to check
     * @returns {boolean} True if path contains dots
     */
    private isNestedPath(path: string): boolean {
        return path.includes('.');
    }
}
