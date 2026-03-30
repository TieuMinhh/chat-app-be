import { Response, NextFunction } from 'express';
import { searchService } from './search.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export class SearchController {
  async searchUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        ApiResponse.success(res, []);
        return;
      }
      const results = await searchService.searchUsers(query.trim(), req.user!.userId);
      ApiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  async searchConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        ApiResponse.success(res, []);
        return;
      }
      const results = await searchService.searchConversations(query.trim(), req.user!.userId);
      ApiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  async searchMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const conversationId = req.query.conversationId as string;

      if (!query || query.trim().length === 0 || !conversationId) {
        ApiResponse.success(res, []);
        return;
      }

      const results = await searchService.searchMessages(
        query.trim(),
        conversationId,
        req.user!.userId
      );
      ApiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
