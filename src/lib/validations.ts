import { z } from 'zod';

// Auth validation schemas
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  remember_me: z.boolean().optional(),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val),
      'Please enter a valid phone number'
    ),
  warehouse_id: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const magicLinkSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const passwordResetConfirmSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const emailVerificationSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required'),
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val),
      'Please enter a valid phone number'
    ),
});

export const passwordChangeSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirm_password: z
    .string()
    .min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const phoneVerificationSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+?[\d\s\-\(\)]+$/,
      'Please enter a valid phone number'
    ),
  verification_code: z
    .string()
    .min(1, 'Verification code is required')
    .length(6, 'Verification code must be 6 digits'),
});

export const twoFactorSetupSchema = z.object({
  method: z.enum(['totp', 'sms']),
  phone: z.string().optional(),
});

export const apiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  permissions: z
    .array(z.string())
    .min(1, 'At least one permission must be selected'),
});

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  email_types: z.object({
    booking_confirmations: z.boolean(),
    schedule_changes: z.boolean(),
    system_alerts: z.boolean(),
    weekly_reports: z.boolean(),
  }),
  sms_types: z.object({
    urgent_alerts: z.boolean(),
    gate_notifications: z.boolean(),
  }),
});

// Type exports
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type PhoneVerificationInput = z.infer<typeof phoneVerificationSchema>;
export type TwoFactorSetupInput = z.infer<typeof twoFactorSetupSchema>;
export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;