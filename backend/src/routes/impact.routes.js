import { Router } from "express";
import * as impactController from "../controllers/impact.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", impactController.getSummary);
router.get("/breakdown", impactController.getBreakdown);
router.get("/recent", impactController.getRecent);
router.get("/listing/:listingId", impactController.getForListing);

export default router;