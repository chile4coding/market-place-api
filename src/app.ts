import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import path from "path";
import {
  errorHandler,
  requestIdMiddleware,
  notFoundHandler,
} from "@/middleware/error";
import authRoutes from "@/modules/auth/routes/routes";
import userRoutes from "@/modules/users/routes/routes";
import swaggerRoutes from "@/modules/auth/routes/swagger.routes";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestIdMiddleware);

  // Serve static files for swagger auth script
  app.use('/swagger-auth.js', express.static(path.join(process.cwd(), 'swagger-auth.js')));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api-docs", swaggerRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
