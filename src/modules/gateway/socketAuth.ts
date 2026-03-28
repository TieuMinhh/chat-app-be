import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { JwtPayload } from '../../shared/types';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload;
  };
}

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('UNAUTHORIZED: Access token is required'));
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    socket.data.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('TOKEN_EXPIRED: Access token has expired'));
    }
    return next(new Error('UNAUTHORIZED: Invalid access token'));
  }
};
