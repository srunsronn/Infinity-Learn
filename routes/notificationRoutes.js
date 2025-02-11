import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";
import {
  getAllNotifications,
  createNotification,
  getAllUserNotifications,
  readNotification,
  deleteNotification,
  sendNotification
} from "../controllers/api/v1/notificationController.js";

const router = express.Router();

router.post("/create-noti", authenticate, createNotification);
router.get("/get-all-noti", authenticate, getAllUserNotifications);
router.put("/:id/read", authenticate, readNotification);
router.delete("/:id", authenticate, deleteNotification);
//admin only
router.get(
  "/admin/get-all-noti",
  authenticate,
  verifyRole("admin"),
  getAllNotifications
);

router.post("/send-notification", authenticate, sendNotification)

export default router;
