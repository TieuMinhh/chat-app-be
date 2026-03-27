import { z } from 'zod';

export const createConversationSchema = z.object({
  type: z.enum(['private', 'group']),
  memberId: z.string().optional(), // For private chat - the other user's ID
  memberIds: z.array(z.string()).optional(), // For group chat
  name: z.string().min(1).max(100).optional(), // For group chat
}).refine(
  (data) => {
    if (data.type === 'private') return !!data.memberId;
    if (data.type === 'group') return !!data.memberIds && data.memberIds.length >= 2;
    return false;
  },
  {
    message: 'Private chat requires memberId, group chat requires at least 2 memberIds',
  }
);

export const updateConversationSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
}).refine(
  (data) => data.name || data.avatar,
  { message: 'At least one field (name or avatar) is required to update' }
);

export const addMembersSchema = z.object({
  memberIds: z.array(z.string().min(1)).min(1, 'At least one member is required'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type AddMembersInput = z.infer<typeof addMembersSchema>;
