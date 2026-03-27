import { Response, NextFunction } from 'express';
import { conversationService } from './conversation.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export class ConversationController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await conversationService.createConversation(req.user!.userId, req.body);
      const statusCode = result.isNew ? 201 : 200;
      ApiResponse.success(res, result.conversation, result.isNew ? 'Conversation created' : 'Conversation found', statusCode);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await conversationService.getUserConversations(req.user!.userId);
      ApiResponse.success(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await conversationService.getConversation(
        req.params.id,
        req.user!.userId
      );
      ApiResponse.success(res, conversation);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await conversationService.updateConversation(
        req.params.id,
        req.user!.userId,
        req.body
      );
      ApiResponse.success(res, conversation, 'Conversation updated');
    } catch (error) {
      next(error);
    }
  }

  async addMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await conversationService.addMembers(
        req.params.id,
        req.user!.userId,
        req.body
      );
      ApiResponse.success(res, conversation, 'Members added');
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await conversationService.removeMember(
        req.params.id,
        req.user!.userId,
        req.params.userId
      );
      ApiResponse.success(res, conversation, 'Member removed');
    } catch (error) {
      next(error);
    }
  }

  async leave(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await conversationService.leaveConversation(
        req.params.id,
        req.user!.userId
      );
      ApiResponse.success(res, conversation, 'Left conversation');
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();
