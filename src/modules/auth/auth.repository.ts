import { User, IUserDocument, RefreshToken } from './auth.model';

export class AuthRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email }).select('+password');
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    return User.findOne({ username });
  }

  async createUser(data: {
    username: string;
    displayName: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<IUserDocument> {
    return User.create(data);
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await RefreshToken.create({ userId, token, expiresAt });
  }

  async findRefreshToken(token: string) {
    return RefreshToken.findOne({ token });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  }
}

export const authRepository = new AuthRepository();
