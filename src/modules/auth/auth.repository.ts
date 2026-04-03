import { User, IUserDocument } from './auth.model';

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

}

export const authRepository = new AuthRepository();
