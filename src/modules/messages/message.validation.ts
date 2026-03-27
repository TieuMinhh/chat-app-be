import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  content: z.string().optional().default(''),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
      })
    )
    .optional()
    .default([]),
  replyTo: z.string().optional(),
});

export const getMessagesSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
  before: z.string().optional(), // cursor: message ID
  limit: z
    .string()
    .optional()
    .default('20')
    .transform((val) => Math.min(parseInt(val, 10) || 20, 50)),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
