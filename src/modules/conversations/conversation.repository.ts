import { Conversation, IConversationDocument } from './conversation.model';

export class ConversationRepository {
  async findPrivateByMembers(userId1: string, userId2: string): Promise<any | null> {
    return Conversation.findOne({
      type: 'private',
      'members.userId': { $all: [userId1, userId2] },
      members: { $size: 2 },
    }).lean();
  }

  async create(data: {
    type: 'private' | 'group';
    name?: string;
    members: { userId: string; joinedAt: Date }[];
    adminId?: string;
  }): Promise<IConversationDocument> {
    return Conversation.create(data);
  }

  async findByUserId(userId: string): Promise<any[]> {
    return Conversation.find({
      'members.userId': userId,
    })
      .sort({ updatedAt: -1 })
      .populate('members.userId', 'username displayName avatar status lastSeen')
      .populate({
        path: 'pinnedMessages',
        populate: { path: 'senderId', select: 'username displayName avatar' }
      }).lean();
  }

  async findById(id: string): Promise<any | null> {
    return Conversation.findById(id)
      .populate('members.userId', 'username displayName avatar status lastSeen')
      .populate('adminId', 'username displayName avatar')
      .populate({
        path: 'pinnedMessages',
        populate: { path: 'senderId', select: 'username displayName avatar' }
      }).lean();
  }

  async updateLastMessage(
    conversationId: string,
    lastMessage: { 
      content: string; 
      senderId: string; 
      messageType: string; 
      createdAt: Date;
      readBy?: { userId: string; readAt: Date }[]
    }
  ): Promise<void> {
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { lastMessage },
      updatedAt: new Date(),
    });
  }

  async isMember(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'members.userId': userId,
    });
    return !!conversation;
  }

  async getMemberIds(conversationId: string): Promise<string[]> {
    const conversation = await Conversation.findById(conversationId).select('members.userId');
    if (!conversation) return [];
    return conversation.members.map((m: any) => m.userId.toString());
  }

  // ============ Group Chat Methods ============

  async updateConversation(
    conversationId: string,
    data: { name?: string; avatar?: string }
  ): Promise<any | null> {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: data },
      { new: true }
    ).populate('members.userId', 'username displayName avatar status lastSeen');
    return updated ? updated.toObject() : null;
  }

  async addMembers(
    conversationId: string,
    members: { userId: string; joinedAt: Date }[]
  ): Promise<any | null> {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { $push: { members: { $each: members } } },
      { new: true }
    ).populate('members.userId', 'username displayName avatar status lastSeen');
    return updated ? updated.toObject() : null;
  }

  async removeMember(
    conversationId: string,
    userId: string
  ): Promise<any | null> {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { $pull: { members: { userId } } },
      { new: true }
    ).populate('members.userId', 'username displayName avatar status lastSeen');
    return updated ? updated.toObject() : null;
  }

  async getConversationRaw(conversationId: string): Promise<IConversationDocument | null> {
    return Conversation.findById(conversationId);
  }

  async updateAdmin(conversationId: string, newAdminId: string): Promise<void> {
    await Conversation.findByIdAndUpdate(conversationId, { $set: { adminId: newAdminId } });
  }

  async searchByName(userId: string, query: string, limit = 20): Promise<any[]> {
    return Conversation.find({
      'members.userId': userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('members.userId', 'username displayName avatar status lastSeen')
      .populate({
        path: 'pinnedMessages',
        populate: { path: 'senderId', select: 'username displayName avatar' }
      }).lean();
  }

  async pinMessage(conversationId: string, messageId: string): Promise<any | null> {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { pinnedMessages: messageId } },
      { new: true }
    ).populate({
      path: 'pinnedMessages',
      populate: { path: 'senderId', select: 'username displayName avatar' }
    });
    return updated ? updated.toObject() : null;
  }

  async unpinMessage(conversationId: string, messageId: string): Promise<any | null> {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { $pull: { pinnedMessages: messageId } },
      { new: true }
    ).populate({
      path: 'pinnedMessages',
      populate: { path: 'senderId', select: 'username displayName avatar' }
    });
    return updated ? updated.toObject() : null;
  }
}

export const conversationRepository = new ConversationRepository();
