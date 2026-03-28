import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socketAuth';
import { userRepository } from '../../users/user.repository';

// Map of userId -> Set of socketIds (user can have multiple connections)
const onlineUsers = new Map<string, Set<string>>();

export const handleConnection = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.data.user.userId;

  // Join personal room for private events
  socket.join(`user:${userId}`);

  // Add user to online map
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socket.id);

  // If this is the first connection, broadcast online status
  if (onlineUsers.get(userId)!.size === 1) {
    userRepository.updateStatus(userId, 'online');
    io.emit('user_online', { userId });
  }

  // Handle disconnect
  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);

      // If no more connections, user is offline
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        userRepository.updateStatus(userId, 'offline');
        socket.broadcast.emit('user_offline', {
          userId,
          lastSeen: new Date(),
        });
      }
    }

    console.log(`👤 User ${userId} disconnected (socket: ${socket.id})`);
  });
};

export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};

export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId) && onlineUsers.get(userId)!.size > 0;
};

export const getUserSocketIds = (userId: string): string[] => {
  const sockets = onlineUsers.get(userId);
  return sockets ? Array.from(sockets) : [];
};
