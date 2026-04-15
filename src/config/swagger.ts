import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./index";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Marketplace API",
      version: "1.0.0",
      description: "Online Marketplace Platform API",
      contact: {
        name: "API Support",
        email: "support@marketplace.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
      },
      {
        url: `http://185.200.244.215:8000`,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            statusCode: { type: "number", example: 400 },
            error: { type: "string", example: "VALIDATION_ERROR" },
            message: { type: "string" },
            details: { type: "array" },
            requestId: { type: "string" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    // for local dev (ts files)
    path.join(__dirname, "../src/routes/**/*.ts"),
    path.join(__dirname, "../src/modules/**/routes/**/*.ts"),
    // for production (compiled js files)
    path.join(__dirname, "./routes/**/*.js"),
    path.join(__dirname, "./modules/**/routes/**/*.js"),
  ],
};

export const swaggerSpec: any = swaggerJsdoc(options);
