import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./index";

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
        description: "production server",
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/modules/**/routes/**/*.ts"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const swaggerSpec: any = swaggerJsdoc(options);
