import { Router } from "express";
import * as listingsController from "../controllers/listings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { uploadPhotosMiddleware } from "../middleware/upload.js";
import { parseMultipartJson } from "../middleware/parseMultipart.js";
import {
  createListingSchema,
  updateStatusSchema,
  completeListingSchema,
} from "../validators/listing.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// All listing routes require auth
router.use(requireAuth);

// Create (household only, multipart form-data with optional photos)
router.post(
  "/",
  requireRole(ROLES.HOUSEHOLD),
  uploadPhotosMiddleware,
  parseMultipartJson,
  validate(createListingSchema),
  listingsController.create
);

// My listings (household only)
router.get("/", requireRole(ROLES.HOUSEHOLD), listingsController.getMine);

// Get one (owner or recycler or admin)
router.get("/:id", listingsController.getOne);

// Accept (recycler only, atomic)
router.post(
  "/:id/accept",
  requireRole(ROLES.RECYCLER),
  listingsController.accept
);

// Update status (owner or assigned recycler or admin)
router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  listingsController.updateStatus
);

// Complete (assigned recycler only)
router.post(
  "/:id/complete",
  requireRole(ROLES.RECYCLER),
  validate(completeListingSchema),
  listingsController.complete
);

export default router;