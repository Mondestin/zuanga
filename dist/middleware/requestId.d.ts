import { Request, Response, NextFunction } from 'express';
/**
 * Extend Express Request to include requestId
 */
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
        }
    }
}
/**
 * Request ID middleware
 * Generates a unique request ID for each request and attaches it to the request object
 * Also sets it as a response header for tracing
 */
export declare function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=requestId.d.ts.map