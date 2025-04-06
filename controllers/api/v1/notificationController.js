import asyncHandler from "../../../middlewares/asyncHandler.js";
import NotificationService from "../../../services/notificationService.js";

const getAllNotifications = asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const notifications = await NotificationService.getUserNotifications(
    req.user._id,
    { limit, page }
  );
  res.json({
    success: true,
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: await NotificationService.count({ userId: req.user._id }),
    },
  });
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await NotificationService.createNotification({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json({ success: true, data: notification });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(req.params.id);
  if (!notification) {
    return res
      .status(404)
      .json({ success: false, message: "Notification not found" });
  }
  res.json({ success: true, data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await NotificationService.markAllAsRead(req.user._id);
  res.json({
    success: true,
    data: {
      markedCount: result.modifiedCount,
    },
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await NotificationService.count({
    userId: req.user._id,
    status: "unread",
  });
  res.json({ success: true, data: { count } });
});

export {
  getAllNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
