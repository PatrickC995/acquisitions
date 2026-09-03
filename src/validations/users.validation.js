import z from 'zod';

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number)
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  email: z.email().max(255).toLowerCase().trim().optional(),
  password: z.string().min(6).max(255).optional(),
  role: z.enum(['user', 'admin']).optional()
});
