import { api } from '@/lib/api';
import type {
  Dock,
  Carrier,
  CargoType,
  SlotRule,
  ScheduleSlot,
  ScheduleBooking,
  ScheduleFilter,
  ScheduleViewMode,
  ScheduleConflict,
  ScheduleExportOptions,
  ScheduleStats,
  CreateSlotRuleInput,
  UpdateSlotRuleInput,
  RescheduleBookingInput,
} from '@/types/schedule';

// Dock Management API
export const dockApi = {
  getAll: async (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<Dock[]>(`/docks${params}`);
  },

  getById: async (id: string) => {
    return api.get<Dock>(`/docks/${id}`);
  },

  create: async (data: Omit<Dock, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<Dock>('/docks', data);
  },

  update: async (id: string, data: Partial<Dock>) => {
    return api.put<Dock>(`/docks/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/docks/${id}`);
  },
};

// Carrier Management API
export const carrierApi = {
  getAll: async (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<Carrier[]>(`/carriers${params}`);
  },

  getById: async (id: string) => {
    return api.get<Carrier>(`/carriers/${id}`);
  },

  create: async (data: Omit<Carrier, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<Carrier>('/carriers', data);
  },

  update: async (id: string, data: Partial<Carrier>) => {
    return api.put<Carrier>(`/carriers/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/carriers/${id}`);
  },
};

// Cargo Type Management API
export const cargoTypeApi = {
  getAll: async (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<CargoType[]>(`/cargo-types${params}`);
  },

  getById: async (id: string) => {
    return api.get<CargoType>(`/cargo-types/${id}`);
  },

  create: async (data: Omit<CargoType, 'id' | 'created_at' | 'updated_at'>) => {
    return api.post<CargoType>('/cargo-types', data);
  },

  update: async (id: string, data: Partial<CargoType>) => {
    return api.put<CargoType>(`/cargo-types/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/cargo-types/${id}`);
  },
};

// Slot Rule Management API
export const slotRuleApi = {
  getAll: async (warehouseId?: string, dockId?: string) => {
    const params = new URLSearchParams();
    if (warehouseId) params.append('warehouse_id', warehouseId);
    if (dockId) params.append('dock_id', dockId);
    const queryString = params.toString();
    return api.get<SlotRule[]>(`/slot-rules${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return api.get<SlotRule>(`/slot-rules/${id}`);
  },

  create: async (data: CreateSlotRuleInput) => {
    return api.post<SlotRule>('/slot-rules', data);
  },

  update: async (id: string, data: UpdateSlotRuleInput) => {
    return api.put<SlotRule>(`/slot-rules/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/slot-rules/${id}`);
  },

  generateSlots: async (ruleId: string, startDate: string, endDate: string) => {
    return api.post<ScheduleSlot[]>(`/slot-rules/${ruleId}/generate-slots`, {
      start_date: startDate,
      end_date: endDate,
    });
  },
};

// Schedule Management API
export const scheduleApi = {
  getSlots: async (
    warehouseId: string,
    viewMode: ScheduleViewMode,
    filters?: ScheduleFilter
  ) => {
    const params = new URLSearchParams({
      warehouse_id: warehouseId,
      view_type: viewMode.type,
      date: viewMode.date,
    });

    if (filters) {
      if (filters.dock_ids?.length) {
        params.append('dock_ids', filters.dock_ids.join(','));
      }
      if (filters.carrier_ids?.length) {
        params.append('carrier_ids', filters.carrier_ids.join(','));
      }
      if (filters.cargo_types?.length) {
        params.append('cargo_types', filters.cargo_types.join(','));
      }
      if (filters.statuses?.length) {
        params.append('statuses', filters.statuses.join(','));
      }
      if (filters.adr_required !== undefined) {
        params.append('adr_required', filters.adr_required.toString());
      }
      if (filters.temperature_controlled !== undefined) {
        params.append('temperature_controlled', filters.temperature_controlled.toString());
      }
      if (filters.hazmat !== undefined) {
        params.append('hazmat', filters.hazmat.toString());
      }
      if (filters.date_range) {
        params.append('start_date', filters.date_range.start);
        params.append('end_date', filters.date_range.end);
      }
    }

    return api.get<ScheduleSlot[]>(`/schedule/slots?${params.toString()}`);
  },

  getBookings: async (
    warehouseId: string,
    viewMode: ScheduleViewMode,
    filters?: ScheduleFilter
  ) => {
    const params = new URLSearchParams({
      warehouse_id: warehouseId,
      view_type: viewMode.type,
      date: viewMode.date,
    });

    if (filters) {
      if (filters.dock_ids?.length) {
        params.append('dock_ids', filters.dock_ids.join(','));
      }
      if (filters.carrier_ids?.length) {
        params.append('carrier_ids', filters.carrier_ids.join(','));
      }
      if (filters.cargo_types?.length) {
        params.append('cargo_types', filters.cargo_types.join(','));
      }
      if (filters.statuses?.length) {
        params.append('statuses', filters.statuses.join(','));
      }
      if (filters.adr_required !== undefined) {
        params.append('adr_required', filters.adr_required.toString());
      }
      if (filters.temperature_controlled !== undefined) {
        params.append('temperature_controlled', filters.temperature_controlled.toString());
      }
      if (filters.hazmat !== undefined) {
        params.append('hazmat', filters.hazmat.toString());
      }
      if (filters.date_range) {
        params.append('start_date', filters.date_range.start);
        params.append('end_date', filters.date_range.end);
      }
    }

    return api.get<ScheduleBooking[]>(`/schedule/bookings?${params.toString()}`);
  },

  getConflicts: async (warehouseId: string, dateRange?: { start: string; end: string }) => {
    const params = new URLSearchParams({ warehouse_id: warehouseId });
    if (dateRange) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }
    return api.get<ScheduleConflict[]>(`/schedule/conflicts?${params.toString()}`);
  },

  getStats: async (warehouseId: string, dateRange?: { start: string; end: string }) => {
    const params = new URLSearchParams({ warehouse_id: warehouseId });
    if (dateRange) {
      params.append('start_date', dateRange.start);
      params.append('end_date', dateRange.end);
    }
    return api.get<ScheduleStats>(`/schedule/stats?${params.toString()}`);
  },

  rescheduleBooking: async (data: RescheduleBookingInput) => {
    return api.post<{ success: boolean; conflicts?: ScheduleConflict[] }>(
      '/schedule/reschedule-booking',
      data
    );
  },

  assignBookingToSlot: async (bookingId: string, slotId: string) => {
    return api.post<{ success: boolean; conflicts?: ScheduleConflict[] }>(
      '/schedule/assign-booking',
      { booking_id: bookingId, slot_id: slotId }
    );
  },

  exportSchedule: async (options: ScheduleExportOptions) => {
    const response = await api.post<{ download_url: string }>('/schedule/export', options);
    return response;
  },

  // Real-time updates
  subscribeToUpdates: (warehouseId: string, callback: (data: any) => void) => {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll return a mock subscription
    const interval = setInterval(() => {
      // Mock real-time updates
      callback({
        type: 'schedule_updated',
        warehouse_id: warehouseId,
        timestamp: new Date().toISOString(),
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  },
};