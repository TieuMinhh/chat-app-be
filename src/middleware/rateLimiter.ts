import rateLimit from 'express-rate-limit';

// General API rate limit: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: {
      code: 'GENERAL_003',
      message: 'Too many requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limit: 10 requests per 15 minutes (anti brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'GENERAL_003',
      message: 'Too many login attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message rate limit: 60 requests per minute
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  message: {
    success: false,
    error: {
      code: 'GENERAL_003',
      message: 'Too many messages. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
