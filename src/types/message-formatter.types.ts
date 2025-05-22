/**
 * @file Message Formatter Types
 * @description Type definitions for log message formatting
 * @author samofprog
 * @license MIT
 */

import { RequestDetails, CompletedRequestDetails } from './index';

/**
 * Function signature for incoming request message formatting
 * Takes request details and returns formatted log message
 */
export type IncomingRequestFormatter = (details: RequestDetails) => string;

/**
 * Function signature for completed request message formatting
 * Takes completed request details and returns formatted log message
 */
export type CompletedRequestFormatter = (
    details: CompletedRequestDetails
) => string;

/**
 * Formatter functions for both incoming and completed requests
 */
export interface MessageFormatters {
    incoming: IncomingRequestFormatter;
    completed: CompletedRequestFormatter;
}
