import bcrypt from 'bcrypt';
import { userRepository } from './user.repository';
import { UpdateProfileInput, ChangePasswordInput } from './user.validation';
import { AppError } from '../../middleware/errorHandler';
import { IUserPublic } from '../../shared/types';

export class UserService {
  private toPublicUser(user: any): IUserPublic {
    return {
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
    };
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 'USER_001', 404);
    }
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<IUserPublic> {
    const user = await userRepository.updateProfile(userId, input);
    if (!user) {
      throw new AppError('User not found', 'USER_001', 404);
    }
    return this.toPublicUser(user);
  }

  async searchUsers(query: string, currentUserId: string): Promise<IUserPublic[]> {
    const users = await userRepository.searchUsers(query, currentUserId);
    return users.map((u) => this.toPublicUser(u));
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    if (userId === targetUserId) {
      throw new AppError('Cannot block yourself', 'USER_002', 400);
    }
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new AppError('User not found', 'USER_001', 404);
    }
    await userRepository.blockUser(userId, targetUserId);
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    await userRepository.unblockUser(userId, targetUserId);
  }

  async getBlockedUsers(userId: string): Promise<IUserPublic[]> {
    const users = await userRepository.getBlockedUsers(userId);
    return users.map((u) => this.toPublicUser(u));
  }

  async checkBlockStatus(userId: string, targetUserId: string): Promise<{ blocked: boolean; blockedBy: string | null }> {
    return userRepository.isBlockedEitherWay(userId, targetUserId);
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 'USER_001', 404);
    }

    const isPasswordValid = await bcrypt.compare(input.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Mật khẩu cũ không chính xác', 'USER_003', 400);
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await userRepository.updatePassword(userId, hashedPassword);
  }
}

export const userService = new UserService();
