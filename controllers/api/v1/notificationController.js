import asyncHandler from "../../../middlewares/asyncHandler.js";
import NotificationService from "../../../services/notificationService.js";
import { onlineUsers} from "../../../index.js";

const getAllNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.findAll();
  res
    .status(200)
    .json({ message: "Get all notifications successfully", result });
});

const createNotification = asyncHandler(async (req, res) => {
  const result = await NotificationService.createNotification(req.body);
  res
    .status(201)
    .json({ message: "Notification created successfully", result });
});

const getAllUserNotifications = asyncHandler(async (req, res) => {
  const result = await NotificationService.findByUserId(req.user._id);
  res
    .status(200)
    .json({ message: "Get all user notifications successfully", result });
});

const readNotification = asyncHandler(async (req, res) => {
  const notification = await NotificationService.updateNotification(
    req.params.id,
    { status: "read" }
  );
  res
    .status(200)
    .json({ message: "Notification read successfully", notification });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await NotificationService.deleteNotification(
    req.params.id
  );
  res
    .status(200)
    .json({ message: "Notification deleted successfully", notification });
});

const sendNotification = asyncHandler(async (req, res) => {
    const { userId, title, message } = req.body;
    const notification = await NotificationService.createNotification({
      userId,
      title,
      message,
    });
  
    const receiverSocketId = onlineUsers.get(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
  
    res.status(200).json({ message: "Notification sent successfully", notification });
  });

export {
  getAllNotifications,
  createNotification,
  getAllUserNotifications,
  readNotification,
  deleteNotification,
  sendNotification
};
