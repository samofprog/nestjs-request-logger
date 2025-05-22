/**
 * @file Header Field Extractor Types
 * @description Type definitions for header field extraction
 * @author samofprog
 * @license MIT
 */

import { Headers } from './headers.types';

/**
 * Function signature for header field extraction
 * Extracts specified header fields from headers object in Go-style format
 */
export type HeaderFieldExtractorFunction = (headers: Headers) => string;
