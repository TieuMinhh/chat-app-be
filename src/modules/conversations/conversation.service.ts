import { conversationRepository } from './conversation.repository';
import { CreateConversationInput, UpdateConversationInput, AddMembersInput } from './conversation.validation';
import { AppError } from '../../middleware/errorHandler';

export class ConversationService {
  async createOrGetPrivateConversation(currentUserId: string, memberId: string) {
    // Check if private conversation already exists
    const existing = await conversationRepository.findPrivateByMembers(currentUserId, memberId);
    if (existing) {
      return { conversation: existing, isNew: false };
    }

    // Create new private conversation
    const conversation = await conversationRepository.create({
      type: 'private',
      members: [
        { userId: currentUserId, joinedAt: new Date() },
        { userId: memberId, joinedAt: new Date() },
      ],
    });

    // Populate members before returning
    const populated = await conversationRepository.findById(conversation._id.toString());
    return { conversation: populated, isNew: true };
  }

  async createGroupConversation(currentUserId: string, memberIds: string[], name?: string) {
    const allMembers = [currentUserId, ...memberIds].map((id) => ({
      userId: id,
      joinedAt: new Date(),
    }));

    const conversation = await conversationRepository.create({
      type: 'group',
      name: name || 'New Group',
      members: allMembers,
      adminId: currentUserId,
    });

    const populated = await conversationRepository.findById(conversation._id.toString());
    return populated;
  }

  async createConversation(currentUserId: string, input: CreateConversationInput) {
    if (input.type === 'private') {
      return this.createOrGetPrivateConversation(currentUserId, input.memberId!);
    }
    const conversation = await this.createGroupConversation(
      currentUserId,
      input.memberIds!,
      input.name
    );
    return { conversation, isNew: true };
  }

  async getUserConversations(userId: string) {
    return conversationRepository.findByUserId(userId);
  }

  async getConversation(conversationId: string, userId: string) {
    // Verify membership
    const isMember = await conversationRepository.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 'CONV_002', 403);
    }

    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 'CONV_001', 404);
    }

    return conversation;
  }

  // ============ Group Chat Methods ============

  async updateConversation(conversationId: string, userId: string, input: UpdateConversationInput) {
    const conv = await conversationRepository.getConversationRaw(conversationId);
    if (!conv) {
      throw new AppError('Conversation not found', 'CONV_001', 404);
    }

    if (conv.type !== 'group') {
      throw new AppError('Cannot update private conversations', 'CONV_003', 400);
    }

    // Only admin can update group info
    if (conv.adminId?.toString() !== userId) {
      throw new AppError('Only admin can update group info', 'CONV_003', 403);
    }

    const updated = await conversationRepository.updateConversation(conversationId, input);
    return updated;
  }

  async addMembers(conversationId: string, userId: string, input: AddMembersInput) {
    const conv = await conversationRepository.getConversationRaw(conversationId);
    if (!conv) {
      throw new AppError('Conversation not found', 'CONV_001', 404);
    }

    if (conv.type !== 'group') {
      throw new AppError('Cannot add members to private chat', 'CONV_003', 400);
    }

    if (conv.adminId?.toString() !== userId) {
      throw new AppError('Only admin can add members', 'CONV_003', 403);
    }

    // Filter out members that are already in the conversation
    const existingMemberIds = conv.members.map((m: any) => m.userId.toString());
    const newMemberIds = input.memberIds.filter((id) => !existingMemberIds.includes(id));

    if (newMemberIds.length === 0) {
      throw new AppError('All users are already members', 'CONV_003', 400);
    }

    const newMembers = newMemberIds.map((id) => ({
      userId: id,
      joinedAt: new Date(),
    }));

    const updated = await conversationRepository.addMembers(conversationId, newMembers);
    return updated;
  }

  async removeMember(conversationId: string, userId: string, targetUserId: string) {
    const conv = await conversationRepository.getConversationRaw(conversationId);
    if (!conv) {
      throw new AppError('Conversation not found', 'CONV_001', 404);
    }

    if (conv.type !== 'group') {
      throw new AppError('Cannot remove members from private chat', 'CONV_003', 400);
    }

    if (conv.adminId?.toString() !== userId) {
      throw new AppError('Only admin can remove members', 'CONV_003', 403);
    }

    if (targetUserId === userId) {
      throw new AppError('Admin cannot remove themselves. Use leave instead.', 'CONV_003', 400);
    }

    const updated = await conversationRepository.removeMember(conversationId, targetUserId);
    return updated;
  }

  async leaveConversation(conversationId: string, userId: string) {
    const conv = await conversationRepository.getConversationRaw(conversationId);
    if (!conv) {
      throw new AppError('Conversation not found', 'CONV_001', 404);
    }

    if (conv.type !== 'group') {
      throw new AppError('Cannot leave private chat', 'CONV_003', 400);
    }

    const isMember = conv.members.some((m: any) => m.userId.toString() === userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 'CONV_002', 403);
    }

    // If admin is leaving, transfer admin to next oldest member
    if (conv.adminId?.toString() === userId) {
      const remainingMembers = conv.members.filter((m: any) => m.userId.toString() !== userId);
      if (remainingMembers.length > 0) {
        // Sort by joinedAt and pick the earliest
        remainingMembers.sort((a: any, b: any) => 
          new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
        );
        await conversationRepository.updateAdmin(conversationId, remainingMembers[0].userId.toString());
      }
    }

    const updated = await conversationRepository.removeMember(conversationId, userId);
    return updated;
  }

  async pinMessage(conversationId: string, userId: string, messageId: string) {
    const isMember = await conversationRepository.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 'CONV_002', 403);
    }

    const updated = await conversationRepository.pinMessage(conversationId, messageId);
    return updated;
  }

  async unpinMessage(conversationId: string, userId: string, messageId: string) {
    const isMember = await conversationRepository.isMember(conversationId, userId);
    if (!isMember) {
      throw new AppError('You are not a member of this conversation', 'CONV_002', 403);
    }

    const updated = await conversationRepository.unpinMessage(conversationId, messageId);
    return updated;
  }
}

export const conversationService = new ConversationService();
