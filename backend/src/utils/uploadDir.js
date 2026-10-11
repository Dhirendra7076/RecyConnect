import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getUploadDir() {
  // src/utils/ → up two levels → project root
  return path.resolve(__dirname, "..", "..", env.UPLOAD_DIR);
}

export function ensureUploadDir() {
  const dir = getUploadDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created uploads directory: ${dir}`);
  }
  return dir;
}