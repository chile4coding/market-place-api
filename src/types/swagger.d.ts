declare module 'swagger-jsdoc' {
  interface SwaggerJsdocOptions {
    definition?: Record<string, unknown>;
    apis?: string[];
  }

  interface OutputOptions {
    format?: 'json' | 'yaml';
    destination?: string;
  }

  export default function swaggerJsdoc(options: SwaggerJsdocOptions): Record<string, unknown>;
}

declare module 'swagger-ui-express' {
  import { Request, Response, NextFunction } from 'express';

  export const serve: (req: Request, res: Response, next: NextFunction) => void;

  interface SwaggerUiOptions {
    customCss?: string;
    customSiteTitle?: string;
    customfavIcon?: string;
    customJs?: string;
  }

  export const setup: (
    swaggerDocument: Record<string, unknown>,
    options?: SwaggerUiOptions
  ) => (req: Request, res: Response, next: NextFunction) => void;
}
