import { createApp } from "./app";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { connectRedis, redis } from "@/config/redis";
import { prisma } from "@/config/database";
import { startEmailWorker } from "@/jobs";
import { processEmailJob } from "./modules/auth/service/email.service";

const startServer = async () => {
  try {
    await connectRedis();
    logger.info("Redis connected");

    await prisma.$connect();
    logger.info("Database connected");

    startEmailWorker(processEmailJob);
    logger.info("Email worker started");

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

    const gracefulShutdown = async () => {
      logger.info("Shutting down gracefully...");
      server.close(async () => {
        await prisma.$disconnect();
        await redis.quit();
        logger.info("Server closed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
