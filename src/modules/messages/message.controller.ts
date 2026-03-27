import { Response, NextFunction } from 'express';
import { messageService } from './message.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export class MessageController {
  async send(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await messageService.sendMessage(req.user!.userId, req.body);
      ApiResponse.created(res, message, 'Message sent');
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversationId, before, limit } = req.query as any;

      if (!conversationId) {
        ApiResponse.error(res, 'GENERAL_001', 'conversationId is required', 400);
        return;
      }

      const result = await messageService.getMessages(
        conversationId as string,
        req.user!.userId,
        {
          before: before as string,
          limit: Math.min(parseInt(limit as string, 10) || 20, 50),
        }
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
