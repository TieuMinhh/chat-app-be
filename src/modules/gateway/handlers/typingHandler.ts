import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socketAuth';

export const handleTyping = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.data.user.userId;

  socket.on('typing_start', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing', {
      conversationId: data.conversationId,
      userId,
    });
  });

  socket.on('typing_stop', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('stop_typing', {
      conversationId: data.conversationId,
      userId,
    });
  });
};
