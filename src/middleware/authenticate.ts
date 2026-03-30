import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthRequest, JwtPayload } from '../shared/types';
import { ApiResponse } from '../shared/utils/apiResponse';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Access token is required');
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      ApiResponse.unauthorized(res, 'Access token expired', 'AUTH_003');
      return;
    }
    ApiResponse.unauthorized(res, 'Invalid access token', 'AUTH_003');
  }
};
