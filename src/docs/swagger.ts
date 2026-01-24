import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './openapi';

/**
 * Swagger documentation setup.
 *
 * Routes:
 * - GET  /api/v1/openapi.json  -> raw OpenAPI spec
 * - GET  /api/v1/docs          -> Swagger UI
 *
 * NOTE: We mount this at the same API prefix used elsewhere to keep URLs consistent.
 */
export function setupSwagger(app: Express, apiPrefix: string): void {
  // Serve raw OpenAPI JSON
  app.get(`${apiPrefix}/openapi.json`, (_req: Request, res: Response) => {
    res.json(openApiSpec);
  });

  // Serve interactive Swagger UI
  app.use(`${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

