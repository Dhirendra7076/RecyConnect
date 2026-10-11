import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { getUploadDir } from "../utils/uploadDir.js";
import { ValidationError } from "../utils/errors.js";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per photo
const MAX_FILES = 5;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, getUploadDir()),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        `Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp`
      )
    );
  }
  cb(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
}).array("photos", MAX_FILES);

// Wrapper that translates multer errors into our ValidationError
export function uploadPhotosMiddleware(req, res, next) {
  multerUpload(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ValidationError("Each photo must be under 5MB"));
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return next(new ValidationError("Maximum 5 photos per listing"));
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new ValidationError(
            `Unexpected file field "${err.field}". Use field name "photos".`
          )
        );
      }
      return next(new ValidationError(`Upload error: ${err.message}`));
    }
    return next(err);
  });
}