import { Notification, INotificationDocument } from './notification.model';

export class NotificationRepository {
  async create(data: {
    userId: string;
    type: 'message' | 'group_invite' | 'group_update' | 'system';
    content: string;
    conversationId?: string;
    senderId?: string;
  }): Promise<INotificationDocument> {
    return Notification.create(data);
  }

  async findByUserId(userId: string, limit = 50): Promise<INotificationDocument[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'username displayName avatar')
      .populate('conversationId', 'name type');
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotificationDocument | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  }
}

export const notificationRepository = new NotificationRepository();
