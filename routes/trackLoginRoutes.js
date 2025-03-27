import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  trackLogin,
  getUserLoginHistory,
  deleteLoginHistory,
} from "../controllers/api/v1/loginHistoryController.js";

const router = express.Router();
router.post("/track-login/:userId", trackLogin);
router.delete("/delete/:id", deleteLoginHistory);
router.get("/login-history/:userId", authenticate, getUserLoginHistory);
export default router;
