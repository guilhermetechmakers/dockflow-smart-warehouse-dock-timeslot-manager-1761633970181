import { api } from '@/lib/api';
import type {
  GateCheckIn,
  QRScanResult,
  PlateLookupResult,
  StatusUpdateResponse,
  RampAssignmentResponse,
  FileUploadResponse,
  RampAssignment,
  GateDeviceInfo,
  OfflineEvent,
  ManualEntryForm,
  NotesForm,
  RampAssignmentForm,
} from '@/types/gate';

// Gate Check-In API
export const gateApi = {
  // Get current gate check-in by booking ID
  getCheckIn: async (bookingId: string) => {
    return api.get<GateCheckIn>(`/gate/check-ins/${bookingId}`);
  },

  // Get check-in by visit ID
  getCheckInByVisit: async (visitId: string) => {
    return api.get<GateCheckIn>(`/gate/visits/${visitId}/check-in`);
  },

  // Scan QR code and get booking details
  scanQRCode: async (qrData: string) => {
    return api.post<QRScanResult>('/gate/scan-qr', { qr_data: qrData });
  },

  // Look up booking by plate number
  lookupByPlate: async (plateNumber: string, carrierName?: string) => {
    return api.post<PlateLookupResult>('/gate/lookup-plate', {
      plate_number: plateNumber,
      carrier_name: carrierName,
    });
  },

  // Manual entry form submission
  manualEntry: async (formData: ManualEntryForm) => {
    return api.post<PlateLookupResult>('/gate/manual-entry', formData);
  },

  // Update check-in status
  updateStatus: async (visitId: string, status: string, notes?: string) => {
    return api.post<StatusUpdateResponse>(`/gate/visits/${visitId}/status`, {
      status,
      notes,
    });
  },

  // Assign ramp to visit
  assignRamp: async (visitId: string, formData: RampAssignmentForm) => {
    return api.post<RampAssignmentResponse>(`/gate/visits/${visitId}/assign-ramp`, formData);
  },

  // Add note to visit
  addNote: async (visitId: string, formData: NotesForm) => {
    return api.post(`/gate/visits/${visitId}/notes`, formData);
  },

  // Upload file (photo or document)
  uploadFile: async (visitId: string, file: File, fileType: 'photo' | 'document') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/gate/visits/${visitId}/files`;
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

    return response.json() as Promise<FileUploadResponse>;
  },

  // Get available ramps for a dock
  getAvailableRamps: async (dockId: string) => {
    return api.get<RampAssignment[]>(`/gate/docks/${dockId}/ramps`);
  },

  // Get all ramps for a warehouse
  getAllRamps: async (warehouseId: string) => {
    return api.get<RampAssignment[]>(`/gate/warehouses/${warehouseId}/ramps`);
  },

  // Get device information
  getDeviceInfo: async () => {
    return api.get<GateDeviceInfo>('/gate/device/info');
  },

  // Register device
  registerDevice: async (deviceInfo: { name: string; location: string }) => {
    return api.post<GateDeviceInfo>('/gate/device/register', deviceInfo);
  },

  // Sync offline events
  syncOfflineEvents: async (events: OfflineEvent[]) => {
    return api.post('/gate/device/sync', { events });
  },

  // Get offline events queue
  getOfflineEvents: async () => {
    return api.get<OfflineEvent[]>('/gate/device/offline-events');
  },

  // Clear offline events
  clearOfflineEvents: async (eventIds: string[]) => {
    return api.post('/gate/device/clear-events', { event_ids: eventIds });
  },

  // Get recent check-ins for the day
  getRecentCheckIns: async (warehouseId?: string, limit = 20) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}&limit=${limit}` : `?limit=${limit}`;
    return api.get<GateCheckIn[]>(`/gate/check-ins/recent${params}`);
  },

  // Get check-in statistics
  getCheckInStats: async (warehouseId?: string, date?: string) => {
    const params = new URLSearchParams();
    if (warehouseId) params.append('warehouse_id', warehouseId);
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    return api.get<{
      total_check_ins: number;
      completed: number;
      in_progress: number;
      waiting: number;
      cancelled: number;
      average_processing_time: number;
      peak_hours: string[];
    }>(`/gate/stats${queryString ? `?${queryString}` : ''}`);
  },

  // Bulk status update
  bulkUpdateStatus: async (visitIds: string[], status: string, notes?: string) => {
    return api.post('/gate/bulk/status-update', {
      visit_ids: visitIds,
      status,
      notes,
    });
  },

  // Get check-in timeline
  getCheckInTimeline: async (visitId: string) => {
    return api.get<{
      visit_id: string;
      events: Array<{
        id: string;
        event_type: string;
        timestamp: string;
        actor_name?: string;
        notes?: string;
        metadata?: Record<string, any>;
      }>;
    }>(`/gate/visits/${visitId}/timeline`);
  },

  // Search check-ins
  searchCheckIns: async (query: string, filters?: {
    status?: string[];
    date_from?: string;
    date_to?: string;
    carrier_name?: string;
    plate_number?: string;
  }) => {
    return api.post<GateCheckIn[]>('/gate/check-ins/search', {
      query,
      filters,
    });
  },

  // Export check-in data
  exportCheckIns: async (filters?: {
    warehouse_id?: string;
    date_from?: string;
    date_to?: string;
    status?: string[];
    format?: 'csv' | 'excel' | 'pdf';
  }) => {
    return api.post<{ download_url: string }>('/gate/check-ins/export', filters);
  },
};

// Offline storage utilities
export const offlineStorage = {
  // Store event for offline processing
  storeEvent: (event: Omit<OfflineEvent, 'id' | 'timestamp' | 'retry_count' | 'status' | 'max_retries'>) => {
    const offlineEvent: OfflineEvent = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retry_count: 0,
      status: 'pending',
      max_retries: 3,
      ...event,
    };

    const events = offlineStorage.getEvents();
    events.push(offlineEvent);
    localStorage.setItem('gate_offline_events', JSON.stringify(events));
    
    return offlineEvent;
  },

  // Get all offline events
  getEvents: (): OfflineEvent[] => {
    const stored = localStorage.getItem('gate_offline_events');
    return stored ? JSON.parse(stored) : [];
  },

  // Update event status
  updateEventStatus: (eventId: string, status: OfflineEvent['status']) => {
    const events = offlineStorage.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.status = status;
      localStorage.setItem('gate_offline_events', JSON.stringify(events));
    }
  },

  // Increment retry count
  incrementRetryCount: (eventId: string) => {
    const events = offlineStorage.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.retry_count += 1;
      if (event.retry_count >= event.max_retries) {
        event.status = 'failed';
      }
      localStorage.setItem('gate_offline_events', JSON.stringify(events));
    }
  },

  // Remove completed events
  removeCompletedEvents: (eventIds: string[]) => {
    const events = offlineStorage.getEvents();
    const filtered = events.filter(e => !eventIds.includes(e.id));
    localStorage.setItem('gate_offline_events', JSON.stringify(filtered));
  },

  // Clear all events
  clearAllEvents: () => {
    localStorage.removeItem('gate_offline_events');
  },

  // Get pending events
  getPendingEvents: (): OfflineEvent[] => {
    return offlineStorage.getEvents().filter(e => e.status === 'pending');
  },

  // Get failed events
  getFailedEvents: (): OfflineEvent[] => {
    return offlineStorage.getEvents().filter(e => e.status === 'failed');
  },
};

// WebSocket connection for real-time updates
export class GateWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private onMessage: (data: any) => void;

  constructor(onMessage: (data: any) => void) {
    this.onMessage = onMessage;
  }

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws/gate';
    const token = localStorage.getItem('auth_token');
    
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('Gate WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('Gate WebSocket disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('Gate WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}