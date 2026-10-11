import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { failure } from "../utils/response.js";
import { isProd } from "../config/env.js";

export function notFoundHandler(req, res) {
  return failure(
    res,
    "NOT_FOUND",
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
}

export function errorHandler(err, req, res, next) {
  // ── Mongoose validation ────────────────────────────────
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return failure(res, "VALIDATION_ERROR", "Database validation failed", 422, details);
  }

  // ── Mongoose duplicate key ─────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return failure(res, "DUPLICATE_KEY", `${field} already exists`, 409);
  }

  // ── Mongoose bad ObjectId ──────────────────────────────
  if (err.name === "CastError") {
    return failure(res, "INVALID_ID", `Invalid ${err.path}: ${err.value}`, 400);
  }

  // ── JWT errors (from jsonwebtoken) ─────────────────────
  if (err.name === "JsonWebTokenError") {
    return failure(res, "INVALID_TOKEN", "Invalid authentication token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return failure(res, "TOKEN_EXPIRED", "Authentication token expired", 401);
  }

  // ── Zod validation ─────────────────────────────────────
  if (err.name === "ZodError") {
    const details = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return failure(res, "VALIDATION_ERROR", "Request validation failed", 422, details);
  }

  // ── Our typed errors ───────────────────────────────────
  if (err instanceof AppError) {
    return failure(res, err.code, err.message, err.statusCode, err.details);
  }

  // ── Unknown ────────────────────────────────────────────
  logger.error("Unhandled error:", err);
  return failure(
    res,
    "INTERNAL_ERROR",
    isProd ? "Internal server error" : err.message,
    500
  );
}