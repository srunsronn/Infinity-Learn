import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getAllNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/api/v1/notificationController.js";

const router = express.Router();

// User notifications
router.get("/", authenticate, getAllNotifications);
router.post("/", authenticate, createNotification);
router.put("/:id/read", authenticate, markAsRead);
router.put("/read-all", authenticate, markAllAsRead);
router.get("/unread-count", authenticate, getUnreadCount);

export default router;
