export const ErrorCodes = {
  // Auth errors
  AUTH_001: 'AUTH_001', // Email already exists
  AUTH_002: 'AUTH_002', // Invalid email or password
  AUTH_003: 'AUTH_003', // Invalid or expired token
  AUTH_004: 'AUTH_004', // Invalid refresh token

  // User errors
  USER_001: 'USER_001', // User not found
  USER_002: 'USER_002', // No permission to update

  // Conversation errors
  CONV_001: 'CONV_001', // Conversation not found
  CONV_002: 'CONV_002', // Not a member of conversation
  CONV_003: 'CONV_003', // Not admin of group

  // Message errors
  MSG_001: 'MSG_001', // Message not found
  MSG_002: 'MSG_002', // No permission to edit/delete
  MSG_003: 'MSG_003', // Message already deleted

  // Upload errors
  UPLOAD_001: 'UPLOAD_001', // File too large
  UPLOAD_002: 'UPLOAD_002', // Unsupported file type

  // General errors
  GENERAL_001: 'GENERAL_001', // Validation error
  GENERAL_002: 'GENERAL_002', // Server error
  GENERAL_003: 'GENERAL_003', // Rate limit exceeded
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
