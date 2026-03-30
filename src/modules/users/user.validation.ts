import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Display name must be at least 3 characters')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  avatar: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
