import winston from 'winston';
/**
 * Create Winston logger instance with error handling
 */
declare let logger: winston.Logger;
export { logger };
/**
 * Logger utility functions
 */
export declare const log: {
    /**
     * Log error message
     */
    error: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log warning message
     */
    warn: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log info message
     */
    info: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log HTTP request
     */
    http: (message: string, meta?: Record<string, unknown>) => void;
    /**
     * Log debug message
     */
    debug: (message: string, meta?: Record<string, unknown>) => void;
};
//# sourceMappingURL=logger.d.ts.map