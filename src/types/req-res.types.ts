/**
 * @file Request/Response Types
 * @description Type definitions for Express and Fastify request/response compatibility
 * @author samofprog
 * @license MIT
 */

import { Request, Response } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Union type for Request objects that works with both Express and Fastify
 */
export type Req = Request | FastifyRequest;

/**
 * Express Response type with status code
 */
export interface ExpressRes extends Response {
    statusCode: number;
}

/**
 * Fastify Response type with status code
 */
export interface FastifyRes extends FastifyReply {
    statusCode: number;
}

/**
 * Union type for Response objects that works with both Express and Fastify
 */
export type Res = ExpressRes | FastifyRes;
