import { Router } from "express";
import * as matchingController from "../controllers/matching.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole(ROLES.HOUSEHOLD),
  matchingController.matchForListing
);

export default router;