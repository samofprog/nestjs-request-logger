/**
 * @file Header Sanitizer Types
 * @description Type definitions for header sanitization
 * @author samofprog
 * @license MIT
 */

import { Headers } from './headers.types';

/**
 * Function signature for header sanitization
 * Takes headers object and returns sanitized version
 */
export type HeaderSanitizerFunction = (headers: Headers) => Headers;
