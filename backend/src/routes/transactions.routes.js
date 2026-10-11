import { Router } from "express";
import * as transactionsController from "../controllers/transactions.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { markPaidSchema } from "../validators/transaction.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.use(requireAuth);

// List my transactions (household or recycler)
router.get(
  "/",
  requireRole(ROLES.HOUSEHOLD, ROLES.RECYCLER, ROLES.ADMIN),
  transactionsController.list
);

// Get one
router.get("/:id", transactionsController.getOne);

// Mark paid (recycler only)
router.patch(
  "/:id/mark-paid",
  requireRole(ROLES.RECYCLER, ROLES.ADMIN),
  validate(markPaidSchema),
  transactionsController.markPaid
);

export default router;