import Notification from "../models/notificationModel.js";
import BaseService from "../utils/baseService.js";
import { onlineUsers } from "../index.js";

class NotificationService extends BaseService {
  constructor(Notification) {
    super(Notification);
  }

  async createNotification(data) {
    const notification = await this.create(data);
    const receiverSocketId = onlineUsers.get(notification.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
    return notification;
  }

 async findByUserId(userId) {
  return this.model.find({ userId }).sort({ createdAt: -1 });  
}
  async updateNotification(id, data) {
    const notification = await this.update(id, data);
    const receiverSocketId = onlineUsers.get(notification.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
    return notification;
  }

  async deleteNotification(id) {
    const notification = await this.delete(id);
    const receiverSocketId = onlineUsers.get(notification.userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-notification", notification);
    }
    return notification;
  }
}

export default new NotificationService(Notification);
