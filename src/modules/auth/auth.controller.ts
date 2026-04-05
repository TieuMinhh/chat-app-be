import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { env } from '../../config/env';
import { ApiResponse } from '../../shared/utils/apiResponse';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);

      // Set refresh token as HttpOnly cookie (for web)
      res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

      ApiResponse.created(res, {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // Also return in body for mobile
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body);

      // Set refresh token as HttpOnly cookie (for web)
      res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

      ApiResponse.success(res, {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // Also return in body for mobile
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookie with same options as when it was set
      const { maxAge, ...clearOptions } = COOKIE_OPTIONS;
      res.clearCookie(REFRESH_TOKEN_COOKIE, clearOptions);

      ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const oldRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;

      if (!oldRefreshToken) {
        ApiResponse.unauthorized(res, 'Refresh token is required', 'AUTH_004');
        return;
      }

      const tokens = await authService.refreshToken(oldRefreshToken);

      // Set new refresh token cookie
      res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);

      ApiResponse.success(res, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken, // Also return in body for mobile
      }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
