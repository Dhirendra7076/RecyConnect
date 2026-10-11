import { Router } from "express";
import * as materialsController from "../controllers/materials.controller.js";

const router = Router();

// Public — no auth required (browsing materials is allowed pre-login)
router.get("/", materialsController.getAll);
router.get("/:code", materialsController.getByCode);

export default router;