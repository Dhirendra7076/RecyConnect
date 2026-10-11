import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env, isProd } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { success } from "./utils/response.js";
import { getUploadDir } from "./utils/uploadDir.js";

// ── Route imports (only what exists today) ────────────────
import authRoutes from "./routes/auth.routes.js";
import materialsRoutes from "./routes/materials.routes.js";
import listingsRoutes from "./routes/listings.routes.js";
import recyclerRoutes from "./routes/recycler.routes.js";
import matchingRoutes from "./routes/matching.routes.js";
import pricingRoutes from "./routes/pricing.routes.js";
import impactRoutes from "./routes/impact.routes.js";

// Uncomment these as we build the corresponding steps:
import transactionsRoutes from "./routes/transactions.routes.js";  // Step 6

// import uploadsRoutes from "./routes/uploads.routes.js";             // (future)

export function createApp() {
  const app = express();

  // Behind AWS App Runner / ALB
  app.set("trust proxy", 1);

  // ── CORS ───────────────────────────────────────────────
  const allowedOrigins = [
    env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin) || !isProd) {
          return cb(null, true);
        }
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );

  // ── Body parsers ───────────────────────────────────────
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // ── Request logging ────────────────────────────────────
  app.use(morgan(isProd ? "combined" : "dev"));

  // ── Static file serving (local uploads) ────────────────
  app.use("/uploads", express.static(getUploadDir()));

  // ── Health check ───────────────────────────────────────
  app.get("/api/health", (req, res) => {
    return success(res, {
      status: "ok",
      service: "recyconnect-api",
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  // ── Feature routes ─────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/materials", materialsRoutes);
  app.use("/api/listings", listingsRoutes);
  app.use("/api/recyclers", recyclerRoutes);
  app.use("/api/match", matchingRoutes);
  app.use("/api/pricing", pricingRoutes);
    app.use("/api/transactions", transactionsRoutes);
    app.use("/api/impact", impactRoutes);  

  // ── 404 + global error handler (MUST be last) ──────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}