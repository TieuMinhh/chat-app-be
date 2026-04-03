import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import { AppError } from '../../middleware/errorHandler';
import { AuthTokens, JwtPayload, IUserPublic } from '../../shared/types';

export class AuthService {
  private generateAccessToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  private generateRefreshToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

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

  async register(input: RegisterInput): Promise<{ user: IUserPublic; tokens: AuthTokens }> {
    // Check email exists
    const existingEmail = await authRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new AppError('Email already exists', 'AUTH_001', 409);
    }

    // Check username exists
    const existingUsername = await authRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new AppError('Username already exists', 'AUTH_001', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await authRepository.createUser({
      ...input,
      displayName: input.username,
      password: hashedPassword,
    });

    // Generate tokens
    const payload: JwtPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);


    return {
      user: this.toPublicUser(user),
      tokens: { accessToken, refreshToken },
    };
  }

  async login(input: LoginInput): Promise<{ user: IUserPublic; tokens: AuthTokens }> {
    // Find user
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 'AUTH_002', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 'AUTH_002', 401);
    }

    // Generate tokens
    const payload: JwtPayload = { userId: user._id.toString(), email: user.email };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);


    return {
      user: this.toPublicUser(user),
      tokens: { accessToken, refreshToken },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // With stateless JWT, we rely on token expiration on client side removing it
    // In a real app we might put it on a redis blacklist
  }

  async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new AppError('Invalid refresh token', 'AUTH_004', 401);
    }

    // Since we removed DB whitelisting, we rely solely on JWT verification

    // Generate new tokens
    const payload: JwtPayload = { userId: decoded.userId, email: decoded.email };
    const newAccessToken = this.generateAccessToken(payload);
    const newRefreshToken = this.generateRefreshToken(payload);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
