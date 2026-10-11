import { ValidationError } from "../utils/errors.js";

const JSON_FIELDS = ["pickupAddress", "deductions"];
const NUMBER_FIELDS = ["estimatedWeightKg"];

export function parseMultipartJson(req, _res, next) {
  if (!req.is("multipart/form-data")) return next();

  for (const field of JSON_FIELDS) {
    const raw = req.body[field];
    if (typeof raw === "string") {
      try {
        req.body[field] = JSON.parse(raw);
      } catch {
        return next(new ValidationError(`${field} must be valid JSON`));
      }
    }
  }

  for (const field of NUMBER_FIELDS) {
    const raw = req.body[field];
    if (typeof raw === "string" && raw.trim() !== "") {
      const n = Number(raw);
      if (Number.isNaN(n)) {
        return next(new ValidationError(`${field} must be a number`));
      }
      req.body[field] = n;
    }
  }

  next();
}