import { Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export class NotificationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationService.getNotifications(req.user!.userId);
      const unreadCount = await notificationService.getUnreadCount(req.user!.userId);
      ApiResponse.success(res, { notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user!.userId
      );
      ApiResponse.success(res, notification, 'Marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
