import { Response, NextFunction } from 'express';
import { userService } from './user.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { AuthRequest } from '../../shared/types';

export class UserController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.userId);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getProfile(req.params.id);
      ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = { ...req.body };
      
      if (req.file) {
        const { uploadToCloudinary } = await import('../../shared/utils/cloudinaryUploader');
        const avatarUrl = await uploadToCloudinary(req.file.buffer, 'messenger-clone/avatars');
        input.avatar = avatarUrl;
      }

      const user = await userService.updateProfile(req.user!.userId, input);
      ApiResponse.success(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        ApiResponse.success(res, []);
        return;
      }
      const users = await userService.searchUsers(query.trim(), req.user!.userId);
      ApiResponse.success(res, users);
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.blockUser(req.user!.userId, req.params.id);
      ApiResponse.success(res, null, 'User blocked');
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.unblockUser(req.user!.userId, req.params.id);
      ApiResponse.success(res, null, 'User unblocked');
    } catch (error) {
      next(error);
    }
  }

  async getBlockedUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getBlockedUsers(req.user!.userId);
      ApiResponse.success(res, users);
    } catch (error) {
      next(error);
    }
  }

  async checkBlockStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await userService.checkBlockStatus(req.user!.userId, req.params.id);
      ApiResponse.success(res, status);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.changePassword(req.user!.userId, req.body);
      ApiResponse.success(res, null, 'Đổi mật khẩu thành công');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
