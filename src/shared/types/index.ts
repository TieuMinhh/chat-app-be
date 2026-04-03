import { Types } from 'mongoose';

// ============ User Types ============
export interface IUser {
  _id: Types.ObjectId;
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  blockedUsers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  createdAt: Date;
}

// ============ Conversation Types ============
export interface IConversationMember {
  userId: Types.ObjectId;
  joinedAt: Date;
}

export interface ILastMessage {
  content: string;
  senderId: Types.ObjectId;
  messageType: string;
  createdAt: Date;
}

export interface IConversation {
  _id: Types.ObjectId;
  type: 'private' | 'group';
  name: string | null;
  avatar: string | null;
  members: IConversationMember[];
  adminId: Types.ObjectId | null;
  lastMessage: ILastMessage | null;
  pinnedMessages: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ Message Types ============
export interface IAttachment {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface IReadReceipt {
  userId: Types.ObjectId;
  readAt: Date;
}

export interface IDeliveryReceipt {
  userId: Types.ObjectId;
  deliveredAt: Date;
}

export interface IReaction {
  userId: Types.ObjectId;
  emoji: string;
}

export interface ILinkMetadata {
  title?: string;
  description?: string;
  image?: string;
  url: string;
  siteName?: string;
}

export interface IMessage {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'voice';
  attachments: IAttachment[];
  readBy: IReadReceipt[];
  deliveredTo: IDeliveryReceipt[];
  replyTo: Types.ObjectId | null;
  reactions: IReaction[];
  linkPreview?: ILinkMetadata | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Notification Types ============
export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'new_message' | 'group_invite' | 'mention';
  content: string;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

// ============ Auth Types ============
export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============ Request Types ============
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ============ API Response Types ============
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
