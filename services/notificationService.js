import Notification from "../models/notificationModel.js";
import BaseService from "../utils/baseService.js";
import { io, connectedUsers as onlineUsers } from "../index.js"; 
class NotificationService extends BaseService {
  constructor() {
    super(Notification);
  }

  async createNotification(data) {
    try {
      // Validate input
      if (!data.userId || !data.title || !data.message) {
        throw new Error("Missing required notification fields");
      }

      // Create notification
      const notification = await this.model.create({
        title: data.title,
        message: data.message,
        status: data.status || "unread",
        userId: data.userId,
        metadata: data.metadata || {},
      });

      // Emit real-time notification
      this.emitNotification(notification);

      return notification;
    } catch (error) {
      console.error("Notification creation error:", error);
      throw error;
    }
  }

  async emitNotification(notification) {
    try {
      const receiverSocketId = onlineUsers.get(
        notification.userId.toString()
      )?.socketId; // Use onlineUsers map
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new-notification", notification);
      }
    } catch (error) {
      console.error("Notification emission error:", error);
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 20, page = 1 } = options;
      const skip = (page - 1) * limit;

      return await this.model
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const notification = await this.model.findByIdAndUpdate(
        notificationId,
        { status: "read" },
        { new: true }
      );

      if (notification) {
        this.emitNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const result = await this.model.updateMany(
        { userId, status: "unread" },
        { status: "read" }
      );

      if (result.modifiedCount > 0) {
        const notifications = await this.model.find({ userId });
        notifications.forEach((notification) =>
          this.emitNotification(notification)
        );
      }

      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      console.error("Error counting notifications:", error);
      throw error;
    }
  }
}

export default new NotificationService();
