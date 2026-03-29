import { notificationRepository } from './notification.repository';

export class NotificationService {
  async getNotifications(userId: string) {
    return notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  }

  async createNotification(data: {
    userId: string;
    type: 'message' | 'group_invite' | 'group_update' | 'system';
    content: string;
    conversationId?: string;
    senderId?: string;
  }) {
    return notificationRepository.create(data);
  }
}

export const notificationService = new NotificationService();
