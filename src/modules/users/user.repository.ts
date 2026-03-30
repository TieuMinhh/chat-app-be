import { User, IUserDocument } from '../auth/auth.model';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByIds(ids: string[]): Promise<IUserDocument[]> {
    return User.find({ _id: { $in: ids } });
  }

  async updateProfile(id: string, data: Partial<{ username: string; avatar: string }>): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async updateStatus(id: string, status: 'online' | 'offline'): Promise<void> {
    const update: any = { status };
    if (status === 'offline') {
      update.lastSeen = new Date();
    }
    await User.findByIdAndUpdate(id, { $set: update });
  }

  async searchUsers(query: string, excludeUserId: string, limit = 20): Promise<IUserDocument[]> {
    return User.find({
      _id: { $ne: excludeUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).limit(limit);
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetUserId },
    });
  }

  async unblockUser(userId: string, targetUserId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: targetUserId },
    });
  }

  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const user = await User.findById(userId).select('blockedUsers');
    return user?.blockedUsers?.some((id: any) => id.toString() === targetUserId) || false;
  }

  async isBlockedEitherWay(userId1: string, userId2: string): Promise<{ blocked: boolean; blockedBy: string | null }> {
    const [user1, user2] = await Promise.all([
      User.findById(userId1).select('blockedUsers'),
      User.findById(userId2).select('blockedUsers'),
    ]);

    if (user1?.blockedUsers?.some((id: any) => id.toString() === userId2)) {
      return { blocked: true, blockedBy: userId1 };
    }
    if (user2?.blockedUsers?.some((id: any) => id.toString() === userId1)) {
      return { blocked: true, blockedBy: userId2 };
    }
    return { blocked: false, blockedBy: null };
  }

  async getBlockedUsers(userId: string): Promise<IUserDocument[]> {
    const user = await User.findById(userId).populate('blockedUsers', 'username displayName avatar status lastSeen');
    return (user?.blockedUsers as any) || [];
  }
}

export const userRepository = new UserRepository();
