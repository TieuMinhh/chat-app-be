import { Server } from 'socket.io';
import http from 'http';
import { socketCorsOptions } from '../../config/cors';
import { socketAuth, AuthenticatedSocket } from './socketAuth';
import { handleConnection, getOnlineUsers } from './handlers/connectionHandler';
import { handleMessage } from './handlers/messageHandler';
import { handleTyping } from './handlers/typingHandler';

let io: Server;

export const initializeGateway = (server: http.Server): Server => {
  io = new Server(server, {
    cors: socketCorsOptions,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    // Send online users list to newly connected user
    socket.emit('online_users', getOnlineUsers());

    // Register handlers
    handleConnection(io, authenticatedSocket);
    handleMessage(io, authenticatedSocket);
    handleTyping(io, authenticatedSocket);
  });

  console.log('📡 Socket.IO Gateway initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
