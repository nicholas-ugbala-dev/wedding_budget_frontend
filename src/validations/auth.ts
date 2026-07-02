import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.email(),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  first_name:   z.string().min(1, 'First name is required'),
  last_name:    z.string().min(1, 'Last name is required'),
  email:        z.email(),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  account_type: z.enum(['couple', 'planner']),
});

export const onboard1Schema = z.object({
  event_name:       z.string().min(1, 'Event name is required'),
  event_date:       z.string().min(1, 'Event date is required'),
  wedding_location: z.string().min(1, 'Location is required'),
  base_currency:    z.string().length(3, 'Select a currency'),
});

export const forgotSchema = z.object({
  email: z.email(),
});

export const resetSchema = z.object({
  password:         z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(1),
  token:            z.string().min(1),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type Onboard1Input = z.infer<typeof onboard1Schema>;
export type ForgotInput   = z.infer<typeof forgotSchema>;
export type ResetInput    = z.infer<typeof resetSchema>;