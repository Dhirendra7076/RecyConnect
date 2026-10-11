import { Router } from "express";
import * as recyclerController from "../controllers/recycler.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { validate } from "../middleware/validate.js";
import { updateRecyclerProfileSchema } from "../validators/recycler.validator.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.use(requireAuth);

router.get("/me", requireRole(ROLES.RECYCLER), recyclerController.getMe);

router.patch(
  "/me",
  requireRole(ROLES.RECYCLER),
  validate(updateRecyclerProfileSchema),
  recyclerController.updateMe
);

router.get("/:id", recyclerController.getById);

export default router;