import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'message' | 'group_invite' | 'group_update' | 'system';
  content: string;
  conversationId?: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['message', 'group_invite', 'group_update', 'system'],
      default: 'message',
    },
    content: { type: String, required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
