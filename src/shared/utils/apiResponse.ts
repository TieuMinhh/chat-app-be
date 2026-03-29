import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized', code = 'AUTH_003') {
    return ApiResponse.error(res, code, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden', code = 'AUTH_003') {
    return ApiResponse.error(res, code, message, 403);
  }

  static notFound(res: Response, message = 'Not found', code = 'GENERAL_001') {
    return ApiResponse.error(res, code, message, 404);
  }

  static conflict(res: Response, message: string, code: string) {
    return ApiResponse.error(res, code, message, 409);
  }

  static serverError(res: Response, message = 'Internal server error') {
    return ApiResponse.error(res, 'GENERAL_002', message, 500);
  }

  static rateLimited(res: Response) {
    return ApiResponse.error(res, 'GENERAL_003', 'Too many requests. Please try again later.', 429);
  }
}
