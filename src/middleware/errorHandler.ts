import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../shared/utils/apiResponse';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, code: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err);

  if (err instanceof AppError) {
    ApiResponse.error(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    ApiResponse.error(res, 'GENERAL_001', 'Validation error', 400, err.message);
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    ApiResponse.conflict(res, 'Duplicate entry', 'GENERAL_001');
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    ApiResponse.unauthorized(res, 'Invalid token', 'AUTH_003');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    ApiResponse.unauthorized(res, 'Token expired', 'AUTH_003');
    return;
  }

  // Default server error
  ApiResponse.serverError(res);
};
