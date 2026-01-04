import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

/**
 * Validation middleware factory
 */
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure req.body exists
      if (!req.body) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Request body is required',
            statusCode: 400,
          },
        });
        return;
      }

      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // ZodError uses 'issues' property, not 'errors'
        const zodIssues = error.issues || [];
        const errors = zodIssues.map((issue) => ({
          field: issue.path && Array.isArray(issue.path) && issue.path.length > 0 
            ? issue.path.join('.') 
            : 'unknown',
          message: issue.message || 'Validation error',
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            statusCode: 400,
            errors: errors.length > 0 ? errors : [{ field: 'unknown', message: 'Validation error' }],
          },
        });
        return;
      }

      // Handle other validation errors
      const errorMessage = error instanceof Error ? error.message : 'Invalid request data';
      
      console.error('Validation error:', error);
      
      res.status(400).json({
        success: false,
        error: {
          message: errorMessage,
          statusCode: 400,
        },
      });
    }
  };
}

