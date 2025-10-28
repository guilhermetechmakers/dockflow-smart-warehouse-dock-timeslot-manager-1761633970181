// Simple fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// API utilities
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: unknown) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => 
    apiRequest(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authApi = {
  signIn: async (credentials: { email: string; password: string; remember_me?: boolean }) => {
    const response = await api.post<{
      user: any;
      token: string;
      refresh_token: string;
      expires_in: number;
    }>('/auth/login', credentials);
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  signUp: async (credentials: { email: string; password: string; full_name: string; phone?: string }) => {
    const response = await api.post<{
      user: any;
      token: string;
      refresh_token: string;
      expires_in: number;
    }>('/auth/register', credentials);
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  signOut: async () => {
    await api.post('/auth/logout', {});
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    return api.get<any>('/auth/me');
  },

  refreshToken: async () => {
    const response = await api.post<{
      token: string;
      refresh_token: string;
      expires_in: number;
    }>('/auth/refresh', {});
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },

  resetPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },

  confirmPasswordReset: async (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },

  verifyEmail: async (token: string) => {
    return api.post('/auth/verify-email', { token });
  },

  sendMagicLink: async (email: string) => {
    return api.post('/auth/magic-link', { email });
  },

  verifyMagicLink: async (token: string) => {
    const response = await api.post<{
      user: any;
      token: string;
      refresh_token: string;
      expires_in: number;
    }>('/auth/verify-magic-link', { token });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    return response;
  },
};

// Warehouse API
export const warehouseApi = {
  getAll: async () => {
    return api.get<any[]>('/warehouses');
  },

  getById: async (id: string) => {
    return api.get<any>(`/warehouses/${id}`);
  },

  getDocks: async (warehouseId: string) => {
    return api.get<any[]>(`/warehouses/${warehouseId}/docks`);
  },

  getSlotRules: async (warehouseId: string) => {
    return api.get<any[]>(`/warehouses/${warehouseId}/slot-rules`);
  },
};

// Booking API
export const bookingApi = {
  getAll: async (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<any[]>(`/bookings${params}`);
  },

  getById: async (id: string) => {
    return api.get<any>(`/bookings/${id}`);
  },

  create: async (booking: any) => {
    return api.post<any>('/bookings', booking);
  },

  update: async (id: string, updates: any) => {
    return api.put<any>(`/bookings/${id}`, updates);
  },

  cancel: async (id: string) => {
    return api.post(`/bookings/${id}/cancel`, {});
  },

  // Public booking API (no auth required)
  createPublic: async (booking: any) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/public/bookings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  getByToken: async (token: string) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/public/bookings/token/${token}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },
};

// Visit API
export const visitApi = {
  getAll: async (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<any[]>(`/visits${params}`);
  },

  getById: async (id: string) => {
    return api.get<any>(`/visits/${id}`);
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    return api.post(`/visits/${id}/status`, { status, notes });
  },

  assignRamp: async (id: string, ramp: string) => {
    return api.post(`/visits/${id}/assign-ramp`, { ramp });
  },

  addNote: async (id: string, note: string) => {
    return api.post(`/visits/${id}/notes`, { note });
  },

  uploadFile: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/visits/${id}/files`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },
};

// Profile API
export const profileApi = {
  getProfile: async () => {
    return api.get<any>('/profile');
  },

  updateProfile: async (data: { full_name: string; phone?: string }) => {
    return api.put<any>('/profile', data);
  },

  changePassword: async (data: { 
    current_password: string; 
    new_password: string; 
  }) => {
    return api.post('/profile/change-password', data);
  },

  // Phone verification
  sendPhoneVerification: async (phone: string) => {
    return api.post('/profile/phone/send-verification', { phone });
  },

  verifyPhone: async (data: { phone: string; verification_code: string }) => {
    return api.post('/profile/phone/verify', data);
  },

  // Two-factor authentication
  getTwoFactorSetup: async () => {
    return api.get<any>('/profile/2fa/setup');
  },

  enableTwoFactor: async (data: { 
    method: 'totp' | 'sms'; 
    phone?: string; 
    verification_code?: string;
  }) => {
    return api.post('/profile/2fa/enable', data);
  },

  disableTwoFactor: async (data: { 
    method: 'totp' | 'sms'; 
    verification_code: string;
  }) => {
    return api.post('/profile/2fa/disable', data);
  },

  // API Keys (admin/manager only)
  getApiKeys: async () => {
    return api.get<any[]>('/profile/api-keys');
  },

  createApiKey: async (data: { name: string; permissions: string[] }) => {
    return api.post<any>('/profile/api-keys', data);
  },

  revokeApiKey: async (keyId: string) => {
    return api.delete(`/profile/api-keys/${keyId}`);
  },

  // Notification preferences
  getNotificationPreferences: async () => {
    return api.get<any>('/profile/notifications');
  },

  updateNotificationPreferences: async (data: any) => {
    return api.put('/profile/notifications', data);
  },

  // Activity logs
  getActivityLogs: async (page = 1, limit = 20) => {
    return api.get<any>(`/profile/activity?page=${page}&limit=${limit}`);
  },
};
