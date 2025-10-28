import { api } from '@/lib/api';
import type {
  DashboardKPI,
  LiveBooking,
  DockStatus,
  ActivityNotification,
  WarehouseYard,
  CalendarTimeSlot,
  DashboardFilters,
  DashboardStats,
  RealTimeUpdate,
  DashboardSettings,
  BulkAction
} from '@/types/dashboard';

// Dashboard KPIs
export const getDashboardKPIs = async (warehouseId: string, dateRange: { start: string; end: string }): Promise<DashboardKPI[]> => {
  const params = new URLSearchParams({
    warehouse_id: warehouseId,
    start: dateRange.start,
    end: dateRange.end
  });
  return api.get<DashboardKPI[]>(`/dashboard/kpis?${params}`);
};

// Live bookings data
export const getLiveBookings = async (filters: DashboardFilters): Promise<LiveBooking[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'date_range') {
        params.append('start', value.start);
        params.append('end', value.end);
      } else if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, String(value));
      }
    }
  });
  return api.get<LiveBooking[]>(`/dashboard/bookings?${params}`);
};

// Dock statuses
export const getDockStatuses = async (warehouseId: string): Promise<DockStatus[]> => {
  return api.get<DockStatus[]>(`/dashboard/docks/${warehouseId}/status`);
};

// Activity notifications
export const getNotifications = async (warehouseId: string, limit = 50): Promise<ActivityNotification[]> => {
  const params = new URLSearchParams({
    warehouse_id: warehouseId,
    limit: String(limit)
  });
  return api.get<ActivityNotification[]>(`/dashboard/notifications?${params}`);
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await api.patch(`/dashboard/notifications/${notificationId}/read`, {});
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (warehouseId: string): Promise<void> => {
  await api.patch(`/dashboard/notifications/read-all`, {
    warehouse_id: warehouseId
  });
};

// Warehouse yard layout
export const getWarehouseYard = async (warehouseId: string): Promise<WarehouseYard> => {
  return api.get<WarehouseYard>(`/dashboard/warehouse/${warehouseId}/yard`);
};

// Calendar time slots
export const getCalendarSlots = async (filters: DashboardFilters): Promise<CalendarTimeSlot[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'date_range') {
        params.append('start', value.start);
        params.append('end', value.end);
      } else if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, String(value));
      }
    }
  });
  return api.get<CalendarTimeSlot[]>(`/dashboard/calendar/slots?${params}`);
};

// Dashboard statistics
export const getDashboardStats = async (warehouseId: string, dateRange: { start: string; end: string }): Promise<DashboardStats> => {
  const params = new URLSearchParams({
    warehouse_id: warehouseId,
    start: dateRange.start,
    end: dateRange.end
  });
  return api.get<DashboardStats>(`/dashboard/stats?${params}`);
};

// Bulk actions
export const getBulkActions = async (): Promise<BulkAction[]> => {
  return api.get<BulkAction[]>('/dashboard/bulk-actions');
};

// Execute bulk action
export const executeBulkAction = async (
  actionId: string,
  bookingIds: string[],
  parameters?: Record<string, any>
): Promise<void> => {
  await api.post(`/dashboard/bulk-actions/${actionId}/execute`, {
    booking_ids: bookingIds,
    parameters
  });
};

// Dock assignment
export const assignDock = async (bookingId: string, dockId: string, rampAssignment?: string): Promise<void> => {
  await api.patch(`/dashboard/bookings/${bookingId}/assign`, {
    dock_id: dockId,
    ramp_assignment: rampAssignment
  });
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: string,
  notes?: string
): Promise<void> => {
  await api.patch(`/dashboard/bookings/${bookingId}/status`, {
    status,
    notes
  });
};

// QR code scanning for gate check-in
export const processQRCode = async (qrData: string): Promise<LiveBooking> => {
  return api.post<LiveBooking>('/dashboard/gate/scan', {
    qr_data: qrData
  });
};

// Manual plate entry for gate check-in
export const processPlateEntry = async (plateNumber: string): Promise<LiveBooking> => {
  return api.post<LiveBooking>('/dashboard/gate/plate', {
    plate_number: plateNumber
  });
};

// Get dashboard settings
export const getDashboardSettings = async (warehouseId: string): Promise<DashboardSettings> => {
  return api.get<DashboardSettings>(`/dashboard/settings/${warehouseId}`);
};

// Update dashboard settings
export const updateDashboardSettings = async (
  warehouseId: string,
  settings: Partial<DashboardSettings>
): Promise<void> => {
  await api.patch(`/dashboard/settings/${warehouseId}`, settings);
};

// Real-time updates (WebSocket connection)
export const subscribeToRealTimeUpdates = (
  warehouseId: string,
  onUpdate: (update: RealTimeUpdate) => void
): WebSocket => {
  const wsUrl = `${import.meta.env.VITE_WS_URL}/dashboard/updates/${warehouseId}`;
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    try {
      const update: RealTimeUpdate = JSON.parse(event.data);
      onUpdate(update);
    } catch (error) {
      console.error('Failed to parse real-time update:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};

// Search bookings
export const searchBookings = async (
  warehouseId: string,
  query: string,
  filters?: Partial<DashboardFilters>
): Promise<LiveBooking[]> => {
  const params = new URLSearchParams({
    warehouse_id: warehouseId,
    query
  });
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'date_range' && typeof value === 'object' && 'start' in value && 'end' in value) {
          params.append('start', value.start);
          params.append('end', value.end);
        } else if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }
  
  return api.get<LiveBooking[]>(`/dashboard/bookings/search?${params}`);
};

// Export dashboard data
export const exportDashboardData = async (
  warehouseId: string,
  format: 'csv' | 'excel' | 'pdf',
  filters: DashboardFilters
): Promise<Blob> => {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/dashboard/export/${format}`;
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      warehouse_id: warehouseId,
      filters
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.blob();
};

// Get booking timeline
export const getBookingTimeline = async (bookingId: string): Promise<any[]> => {
  return api.get<any[]>(`/dashboard/bookings/${bookingId}/timeline`);
};

// Add booking note
export const addBookingNote = async (bookingId: string, note: string): Promise<void> => {
  await api.post(`/dashboard/bookings/${bookingId}/notes`, {
    note
  });
};

// Get conflict suggestions
export const getConflictSuggestions = async (bookingId: string): Promise<any[]> => {
  return api.get<any[]>(`/dashboard/bookings/${bookingId}/conflicts`);
};

// Resolve conflict
export const resolveConflict = async (
  conflictId: string,
  resolution: 'reschedule' | 'reassign' | 'override'
): Promise<void> => {
  await api.post(`/dashboard/conflicts/${conflictId}/resolve`, {
    resolution
  });
};