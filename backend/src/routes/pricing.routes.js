import { Router } from "express";
import * as pricingController from "../controllers/pricing.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { estimatePriceSchema } from "../validators/pricing.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.post(
  "/estimate",
  requireAuth,
  requireRole(ROLES.HOUSEHOLD, ROLES.RECYCLER),
  validate(estimatePriceSchema),
  pricingController.estimate
);

export default router;