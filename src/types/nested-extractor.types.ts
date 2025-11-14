/**
 * @file Nested Extractor Types
 * @description Type definitions for nested object property extraction
 * @author samofprog
 * @license MIT
 */

/**
 * Function signature for extracting nested values from objects
 * Uses dot notation to traverse nested properties
 */
export type NestedExtractorFunction = (
    obj: Record<string, unknown>,
    path: string
) => unknown;
