import { Message, IMessageDocument } from './message.model';
import mongoose from 'mongoose';

export class MessageRepository {
  async create(data: {
    conversationId: string;
    senderId: string;
    content: string;
    messageType: string;
    attachments?: any[];
    replyTo?: string;
    linkPreview?: any;
  }): Promise<IMessageDocument> {
    const message = await Message.create(data);
    return message.populate([
      { path: 'senderId', select: 'username displayName avatar' },
      { 
        path: 'replyTo', 
        populate: { path: 'senderId', select: 'username displayName avatar' } 
      }
    ]);
  }

  async findByConversation(
    conversationId: string,
    options: { before?: string; limit: number }
  ): Promise<{ messages: IMessageDocument[]; hasMore: boolean }> {
    const query: any = { conversationId, isDeleted: false };

    // Cursor-based pagination: get messages before the cursor
    if (options.before) {
      query._id = { $lt: new mongoose.Types.ObjectId(options.before) };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(options.limit + 1) // Fetch one extra to check if there are more
      .populate('senderId', 'username displayName avatar')
      .populate({ 
        path: 'replyTo', 
        populate: { path: 'senderId', select: 'username displayName avatar' } 
      });

    const hasMore = messages.length > options.limit;
    if (hasMore) {
      messages.pop(); // Remove the extra one
    }

    return { messages, hasMore };
  }

  async findById(id: string): Promise<IMessageDocument | null> {
    return Message.findById(id)
      .populate('senderId', 'username avatar');
  }

  async markDelivered(messageId: string, userId: string): Promise<void> {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: {
        deliveredTo: { userId, deliveredAt: new Date() },
      },
    });
  }

  async markRead(conversationId: string, userId: string): Promise<void> {
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
      },
      {
        $addToSet: {
          readBy: { userId, readAt: new Date() },
        },
      }
    );
  }

  async searchByContent(
    conversationId: string,
    query: string,
    limit = 20
  ): Promise<IMessageDocument[]> {
    return Message.find({
      conversationId,
      isDeleted: false,
      content: { $regex: query, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'username displayName avatar');
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<IMessageDocument | null> {
    // Remove existing reaction from the same user if any
    await Message.findByIdAndUpdate(messageId, {
      $pull: { reactions: { userId } },
    });

    // Add new reaction
    return Message.findByIdAndUpdate(
      messageId,
      {
        $push: { reactions: { userId, emoji } },
      },
      { new: true }
    ).populate([
      { path: 'senderId', select: 'username displayName avatar' },
      { 
        path: 'replyTo', 
        populate: { path: 'senderId', select: 'username displayName avatar' } 
      }
    ]);
  }

  async removeReaction(messageId: string, userId: string): Promise<IMessageDocument | null> {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $pull: { reactions: { userId } },
      },
      { new: true }
    ).populate([
      { path: 'senderId', select: 'username displayName avatar' },
      { 
        path: 'replyTo', 
        populate: { path: 'senderId', select: 'username displayName avatar' } 
      }
    ]);
  }

  async updateMessage(messageId: string, userId: string, content: string): Promise<IMessageDocument | null> {
    return Message.findOneAndUpdate(
      { _id: messageId, senderId: userId },
      {
        content,
        isEdited: true,
      },
      { new: true }
    ).populate([
      { path: 'senderId', select: 'username displayName avatar' },
      { 
        path: 'replyTo', 
        populate: { path: 'senderId', select: 'username displayName avatar' } 
      }
    ]);
  }

  async softDelete(messageId: string, userId: string): Promise<IMessageDocument | null> {
    return Message.findOneAndUpdate(
      { _id: messageId, senderId: userId },
      {
        isDeleted: true,
        content: 'Tin nhắn đã bị xóa',
        attachments: [],
      },
      { new: true }
    ).populate('senderId', 'username avatar');
  }
}

export const messageRepository = new MessageRepository();
