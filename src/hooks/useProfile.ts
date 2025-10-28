import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api';
import { toast } from 'sonner';
// Types are used in function signatures but not directly imported

// Query keys
export const profileKeys = {
  profile: ['profile'] as const,
  apiKeys: ['profile', 'api-keys'] as const,
  activityLogs: ['profile', 'activity'] as const,
  notificationPreferences: ['profile', 'notifications'] as const,
  twoFactorSetup: ['profile', '2fa', 'setup'] as const,
};

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: profileApi.getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile, data);
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Profile update failed: ${error.message}`);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: any) => {
      toast.error(`Password change failed: ${error.message}`);
    },
  });
};

// Phone verification mutations
export const useSendPhoneVerification = () => {
  return useMutation({
    mutationFn: profileApi.sendPhoneVerification,
    onSuccess: () => {
      toast.success('Verification code sent to your phone!');
    },
    onError: (error: any) => {
      toast.error(`Failed to send verification code: ${error.message}`);
    },
  });
};

export const useVerifyPhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.verifyPhone,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile, data);
      toast.success('Phone number verified successfully!');
    },
    onError: (error: any) => {
      toast.error(`Phone verification failed: ${error.message}`);
    },
  });
};

// Two-factor authentication
export const useTwoFactorSetup = () => {
  return useQuery({
    queryKey: profileKeys.twoFactorSetup,
    queryFn: profileApi.getTwoFactorSetup,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useEnableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.enableTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: profileKeys.twoFactorSetup });
      toast.success('Two-factor authentication enabled successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to enable 2FA: ${error.message}`);
    },
  });
};

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.disableTwoFactor,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.profile, data);
      queryClient.invalidateQueries({ queryKey: profileKeys.twoFactorSetup });
      toast.success('Two-factor authentication disabled successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to disable 2FA: ${error.message}`);
    },
  });
};

// API Keys (admin/manager only)
export const useApiKeys = () => {
  return useQuery({
    queryKey: profileKeys.apiKeys,
    queryFn: profileApi.getApiKeys,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys });
      toast.success('API key created successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to create API key: ${error.message}`);
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.apiKeys });
      toast.success('API key revoked successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to revoke API key: ${error.message}`);
    },
  });
};

// Notification preferences
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: profileKeys.notificationPreferences,
    queryFn: profileApi.getNotificationPreferences,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.notificationPreferences, data);
      toast.success('Notification preferences updated!');
    },
    onError: (error: any) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });
};

// Activity logs
export const useActivityLogs = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...profileKeys.activityLogs, page, limit],
    queryFn: () => profileApi.getActivityLogs(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
