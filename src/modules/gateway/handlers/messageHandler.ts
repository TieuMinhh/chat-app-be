import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../socketAuth';
import { messageService } from '../../messages/message.service';
import { conversationService } from '../../conversations/conversation.service';
import { conversationRepository } from '../../conversations/conversation.repository';

export const handleMessage = (io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.data.user.userId;

  // Join conversation room
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`📨 User ${userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`📨 User ${userId} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data: {
    tempId: string;
    conversationId: string;
    content: string;
    messageType?: string;
    attachments?: any[];
    replyTo?: string;
  }) => {
    try {
      // Check block status for private conversations
      const conversation = await conversationRepository.findById(data.conversationId);
      if (conversation?.type === 'private') {
        const otherMember = conversation.members.find((m: any) => {
          const mId = m.userId._id ? m.userId._id.toString() : m.userId.toString();
          return mId !== userId;
        });
        if (otherMember) {
          const { userRepository } = await import('../../users/user.repository');
          const otherUserId = (otherMember.userId as any)._id 
            ? (otherMember.userId as any)._id.toString() 
            : otherMember.userId.toString();

          const blockStatus = await userRepository.isBlockedEitherWay(userId, otherUserId);
          if (blockStatus.blocked) {
            socket.emit('blocked', {
              tempId: data.tempId,
              conversationId: data.conversationId,
              blockedBy: blockStatus.blockedBy,
              message: blockStatus.blockedBy === userId
                ? 'Bạn đã chặn người này. Bỏ chặn để gửi tin nhắn.'
                : 'Bạn đã bị chặn nên không thể gửi tin nhắn.',
            });
            return;
          }
        }
      }

      const message = await messageService.sendMessage(userId, {
        conversationId: data.conversationId,
        content: data.content,
        messageType: (data.messageType as any) || 'text',
        attachments: data.attachments || [],
        replyTo: data.replyTo,
      });

      // Confirm to sender (with tempId for optimistic UI matching)
      socket.emit('message_sent', {
        tempId: data.tempId,
        message,
      });

      // Broadcast to all members (including sender on other devices)
      const memberIds = await conversationRepository.getMemberIds(data.conversationId);
      memberIds.forEach((id) => {
        io.to(`user:${id}`).emit('receive_message', message);
      });

      // Create notifications for offline/inactive members
      const senderName = (typeof message.senderId === 'object' 
        ? (message.senderId as any).displayName || (message.senderId as any).username 
        : 'Someone');
      const preview = data.messageType === 'image' ? '📷 Hình ảnh' 
        : data.messageType === 'file' ? '📎 Tệp đính kèm' 
        : data.content.substring(0, 80);

      // Lazy import to avoid circular dependency
      const { notificationService } = await import('../../notifications/notification.service');

      for (const id of memberIds) {
        if (id === userId) continue; // Skip sender
        
        // Check if user is in the conversation room (actively viewing it)
        const userSockets = await io.in(`user:${id}`).fetchSockets();
        const isViewingConversation = userSockets.some(
          (s) => s.rooms.has(`conversation:${data.conversationId}`)
        );

        if (!isViewingConversation) {
          const notification = await notificationService.createNotification({
            userId: id,
            type: 'message',
            content: `${senderName}: ${preview}`,
            conversationId: data.conversationId,
            senderId: userId,
          });

          io.to(`user:${id}`).emit('notification_new', notification);
        }
      }
    } catch (error: any) {
      socket.emit('error', {
        code: 'MSG_001',
        message: error.message || 'Failed to send message',
        event: 'send_message',
      });
    }
  });

  // Mark message as delivered
  socket.on('mark_delivered', async (data: { messageId: string; conversationId: string }) => {
    try {
      await messageService.markAsDelivered(data.messageId, userId);

      socket.to(`conversation:${data.conversationId}`).emit('message_delivered', {
        messageId: data.messageId,
        userId,
        deliveredAt: new Date(),
      });
    } catch (error: any) {
      console.error('Error marking delivered:', error);
    }
  });

  // Mark messages as read
  socket.on('read_message', async (data: { conversationId: string }) => {
    try {
      await messageService.markAsRead(data.conversationId, userId);

      socket.to(`conversation:${data.conversationId}`).emit('message_read', {
        conversationId: data.conversationId,
        userId,
        readAt: new Date(),
      });
    } catch (error: any) {
      console.error('Error marking read:', error);
    }
  });

  // Add reaction
  socket.on('add_reaction', async (data: { messageId: string; conversationId: string; emoji: string }) => {
    try {
      const message = await messageService.addReaction(data.messageId, userId, data.emoji);
      io.to(`conversation:${data.conversationId}`).emit('reaction_updated', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        reactions: message.reactions,
      });
    } catch (error: any) {
      socket.emit('error', {
        code: 'REACTION_ERROR',
        message: error.message || 'Failed to add reaction',
        event: 'add_reaction',
      });
    }
  });

  // Remove reaction
  socket.on('remove_reaction', async (data: { messageId: string; conversationId: string }) => {
    try {
      const message = await messageService.removeReaction(data.messageId, userId);
      io.to(`conversation:${data.conversationId}`).emit('reaction_updated', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        reactions: message.reactions,
      });
    } catch (error: any) {
      socket.emit('error', {
        code: 'REACTION_ERROR',
        message: error.message || 'Failed to remove reaction',
        event: 'remove_reaction',
      });
    }
  });

  // Edit message
  socket.on('edit_message', async (data: { messageId: string; conversationId: string; content: string }) => {
    try {
      const message = await messageService.updateMessage(data.messageId, userId, data.content);
      io.to(`conversation:${data.conversationId}`).emit('message_updated', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        content: message.content,
        isEdited: true,
        updatedAt: message.updatedAt,
      });
    } catch (error: any) {
      socket.emit('error', {
        code: 'EDIT_ERROR',
        message: error.message || 'Failed to edit message',
        event: 'edit_message',
      });
    }
  });

  // Delete message
  socket.on('delete_message', async (data: { messageId: string; conversationId: string }) => {
    try {
      const message = await messageService.deleteMessage(data.messageId, userId);
      io.to(`conversation:${data.conversationId}`).emit('message_deleted', {
        messageId: data.messageId,
        conversationId: data.conversationId,
      });
    } catch (error: any) {
      socket.emit('error', {
        code: 'DELETE_ERROR',
        message: error.message || 'Failed to delete message',
        event: 'delete_message',
      });
    }
  });

  // Pin message
  socket.on('pin_message', async (data: { messageId: string; conversationId: string }) => {
    try {
      const conversation = await conversationService.pinMessage(data.conversationId, userId, data.messageId);
      io.to(`conversation:${data.conversationId}`).emit('conversation_updated', conversation);
    } catch (error: any) {
      socket.emit('error', {
        code: 'PIN_ERROR',
        message: error.message || 'Failed to pin message',
        event: 'pin_message',
      });
    }
  });

  // Unpin message
  socket.on('unpin_message', async (data: { messageId: string; conversationId: string }) => {
    try {
      const conversation = await conversationService.unpinMessage(data.conversationId, userId, data.messageId);
      io.to(`conversation:${data.conversationId}`).emit('conversation_updated', conversation);
    } catch (error: any) {
      socket.emit('error', {
        code: 'UNPIN_ERROR',
        message: error.message || 'Failed to unpin message',
        event: 'unpin_message',
      });
    }
  });
};
