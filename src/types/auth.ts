export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  warehouse_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_verified: boolean;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SignInInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  warehouse_id?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface EmailVerification {
  token: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  avatar_url?: string;
  is_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_method?: 'totp' | 'sms';
  phone_verified: boolean;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  email_types: {
    booking_confirmations: boolean;
    schedule_changes: boolean;
    system_alerts: boolean;
    weekly_reports: boolean;
  };
  sms_types: {
    urgent_alerts: boolean;
    gate_notifications: boolean;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used?: string;
  status: 'active' | 'revoked';
  permissions: string[];
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface TwoFactorSetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface PhoneVerification {
  phone: string;
  verification_code: string;
}
