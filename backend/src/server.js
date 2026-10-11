import { createApp } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { ensureUploadDir } from "./utils/uploadDir.js";
import { syncIndexes } from "./models/index.js";

async function bootstrap() {
  try {
    ensureUploadDir();
    await connectDB();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info("───────────────────────────────────────────────");
      logger.info(`🚀 RecyConnect API on http://localhost:${env.PORT}`);
      logger.info(`   Env:    ${env.NODE_ENV}`);
      logger.info(`   Health: http://localhost:${env.PORT}/api/health`);
      logger.info("───────────────────────────────────────────────");
    });

    // ── Graceful shutdown ────────────────────────────────
    const shutdown = async (signal) => {
      logger.info(`${signal} received — shutting down`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
      // Force exit if graceful shutdown hangs
      setTimeout(() => {
        logger.error("Forced shutdown after 10s");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // ── Crash safety net ─────────────────────────────────
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled rejection:", reason);
    });
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught exception:", err);
      shutdown("uncaughtException");
    });
  } catch (err) {
    logger.error("Bootstrap failed:", err);
    process.exit(1);
  }
}

bootstrap();