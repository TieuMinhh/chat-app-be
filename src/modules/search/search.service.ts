import { userService } from '../users/user.service';
import { conversationRepository } from '../conversations/conversation.repository';
import { messageRepository } from '../messages/message.repository';

export class SearchService {
  async searchUsers(query: string, currentUserId: string) {
    return userService.searchUsers(query, currentUserId);
  }

  async searchConversations(query: string, userId: string) {
    return conversationRepository.searchByName(userId, query);
  }

  async searchMessages(query: string, conversationId: string, userId: string, limit = 20) {
    // Verify membership before searching
    const isMember = await conversationRepository.isMember(conversationId, userId);
    if (!isMember) {
      return [];
    }
    return messageRepository.searchByContent(conversationId, query, limit);
  }
}

export const searchService = new SearchService();
