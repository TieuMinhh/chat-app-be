import { messageRepository } from './message.repository';
import { conversationRepository } from '../conversations/conversation.repository';
import { SendMessageInput } from './message.validation';
import { AppError } from '../../middleware/errorHandler';
import { extractUrls, getLinkMetadata } from '../../shared/utils/linkPreview';

export class MessageService {
  async sendMessage(senderId: string, input: SendMessageInput) {
    // Verify user is a member
    const isMember = await conversationRepository.isMember(input.conversationId, senderId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 'CONV_002', 403);
    }

    let linkPreview = null;
    if (input.messageType === 'text' && input.content) {
      const urls = extractUrls(input.content);
      if (urls.length > 0) {
        linkPreview = await getLinkMetadata(urls[0]);
      }
    }

    // Create message
    const message = await messageRepository.create({
      conversationId: input.conversationId,
      senderId,
      content: input.content || '',
      messageType: input.messageType,
      attachments: input.attachments,
      replyTo: input.replyTo,
      linkPreview,
    });

    // Update conversation lastMessage
    await conversationRepository.updateLastMessage(input.conversationId, {
      content: input.content || (input.messageType === 'image' ? '📷 Image' : '📎 File'),
      senderId,
      messageType: input.messageType,
      createdAt: new Date(),
    });

    return message;
  }

  async getMessages(conversationId: string, userId: string, options: { before?: string; limit: number }) {
    // Verify membership
    const isMember = await conversationRepository.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 'CONV_002', 403);
    }

    const { messages, hasMore } = await messageRepository.findByConversation(conversationId, options);

    return {
      messages,
      hasMore,
      nextCursor: hasMore ? messages[messages.length - 1]._id.toString() : null,
    };
  }

  async markAsDelivered(messageId: string, userId: string) {
    await messageRepository.markDelivered(messageId, userId);
  }

  async markAsRead(conversationId: string, userId: string) {
    await messageRepository.markRead(conversationId, userId);
    
    // Also update the conversation's lastMessage readBy status
    // Find the current last message of this conversation
    const { messages } = await messageRepository.findByConversation(conversationId, { limit: 1 });
    if (messages.length > 0) {
      const lastMsg = messages[0];
      await conversationRepository.updateLastMessage(conversationId, {
        content: lastMsg.content,
        senderId: (typeof lastMsg.senderId === 'object' ? (lastMsg.senderId as any)._id : lastMsg.senderId).toString(),
        messageType: lastMsg.messageType,
        createdAt: lastMsg.createdAt as any,
        readBy: lastMsg.readBy as any
      });
    }
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await messageRepository.addReaction(messageId, userId, emoji);
    if (!message) {
      throw new AppError('Message not found', 'MSG_001', 404);
    }
    return message;
  }

  async removeReaction(messageId: string, userId: string) {
    const message = await messageRepository.removeReaction(messageId, userId);
    if (!message) {
      throw new AppError('Message not found', 'MSG_001', 404);
    }
    return message;
  }

  async updateMessage(messageId: string, userId: string, content: string) {
    const message = await messageRepository.updateMessage(messageId, userId, content);
    if (!message) {
      throw new AppError('Message not found or you do not have permission to edit', 'MSG_002', 403);
    }
    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await messageRepository.softDelete(messageId, userId);
    if (!message) {
      throw new AppError('Message not found or you do not have permission to delete', 'MSG_002', 403);
    }
    return message;
  }
}

export const messageService = new MessageService();
