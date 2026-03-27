import mongoose, { Schema, Document } from 'mongoose';
import { IConversation } from '../../shared/types';

export interface IConversationDocument extends Omit<IConversation, '_id'>, Document {}

const conversationSchema = new Schema<IConversationDocument>(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      required: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lastMessage: {
      content: String,
      senderId: Schema.Types.ObjectId,
      messageType: String,
      createdAt: Date,
    },
    pinnedMessages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ 'members.userId': 1 });
conversationSchema.index({ type: 1, 'members.userId': 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model<IConversationDocument>('Conversation', conversationSchema);
