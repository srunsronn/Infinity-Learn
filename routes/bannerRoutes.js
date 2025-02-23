import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

import {
    getAllBanners,
    createBanner,
    updateBanner
} from "../controllers/api/v1/bannerController.js";

const router = express.Router();

router.get("/get-all-banners", authenticate, getAllBanners);
router.post("/create", authenticate, verifyRole("admin"), createBanner);
router.put("/update/:id", authenticate, verifyRole("admin"), updateBanner);

export default router;
