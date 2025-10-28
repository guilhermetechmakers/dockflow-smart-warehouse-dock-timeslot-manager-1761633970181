import { api } from '@/lib/api';
import type {
  VisitDetail,
  CreateDisputeInput,
  UpdateDisputeInput,
  CreateVisitNoteInput,
  VisitExport,
  VisitDetailFilters,
  VisitDetailStats,
  CauseCode,
  VisitNote,
} from '@/types/visit-detail';

// Visit Detail API
export const visitDetailApi = {
  // Get visit details with optional filters
  getVisitDetail: async (visitId: string, filters?: VisitDetailFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = `/visits/${visitId}/detail${queryString ? `?${queryString}` : ''}`;
    
    return api.get<VisitDetail>(endpoint);
  },

  // Get visit stats
  getVisitStats: async (visitId: string) => {
    return api.get<VisitDetailStats>(`/visits/${visitId}/stats`);
  },

  // Get cause codes
  getCauseCodes: async (warehouseId?: string) => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<CauseCode[]>(`/visits/cause-codes${params}`);
  },

  // Update visit status
  updateVisitStatus: async (visitId: string, status: string, notes?: string) => {
    return api.post(`/visits/${visitId}/status`, { status, notes });
  },

  // Assign ramp
  assignRamp: async (visitId: string, ramp: string) => {
    return api.post(`/visits/${visitId}/assign-ramp`, { ramp });
  },

  // Add note
  addNote: async (visitId: string, note: CreateVisitNoteInput) => {
    return api.post<VisitNote>(`/visits/${visitId}/notes`, note);
  },

  // Update note
  updateNote: async (visitId: string, noteId: string, note: Partial<CreateVisitNoteInput>) => {
    return api.put<VisitNote>(`/visits/${visitId}/notes/${noteId}`, note);
  },

  // Delete note
  deleteNote: async (visitId: string, noteId: string) => {
    return api.delete(`/visits/${visitId}/notes/${noteId}`);
  },

  // Upload file
  uploadFile: async (visitId: string, file: File, metadata?: { description?: string; tags?: string[] }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/visits/${visitId}/files`;
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

  // Delete file
  deleteFile: async (visitId: string, fileId: string) => {
    return api.delete(`/visits/${visitId}/files/${fileId}`);
  },

  // Get file download URL
  getFileDownloadUrl: async (visitId: string, fileId: string) => {
    return api.get<{ download_url: string; expires_at: string }>(`/visits/${visitId}/files/${fileId}/download`);
  },

  // Create dispute
  createDispute: async (visitId: string, dispute: CreateDisputeInput) => {
    return api.post(`/visits/${visitId}/disputes`, dispute);
  },

  // Update dispute
  updateDispute: async (visitId: string, disputeId: string, dispute: UpdateDisputeInput) => {
    return api.put(`/visits/${visitId}/disputes/${disputeId}`, dispute);
  },

  // Get dispute
  getDispute: async (visitId: string, disputeId: string) => {
    return api.get(`/visits/${visitId}/disputes/${disputeId}`);
  },

  // List disputes
  getDisputes: async (visitId: string) => {
    return api.get(`/visits/${visitId}/disputes`);
  },

  // Export visit details
  exportVisit: async (visitId: string, format: 'pdf' | 'csv' | 'excel', options?: {
    include_files?: boolean;
    include_notes?: boolean;
    include_timeline?: boolean;
    include_disputes?: boolean;
  }) => {
    return api.post<VisitExport>(`/visits/${visitId}/export`, {
      format,
      ...options,
    });
  },

  // Get visit timeline
  getVisitTimeline: async (visitId: string) => {
    return api.get(`/visits/${visitId}/timeline`);
  },

  // Add timeline event
  addTimelineEvent: async (visitId: string, event: {
    event_type: 'booked' | 'arrived' | 'assigned' | 'started' | 'completed' | 'cancelled';
    notes?: string;
    metadata?: Record<string, any>;
  }) => {
    return api.post(`/visits/${visitId}/timeline`, event);
  },

  // Update timeline event
  updateTimelineEvent: async (visitId: string, eventId: string, event: {
    notes?: string;
    metadata?: Record<string, any>;
  }) => {
    return api.put(`/visits/${visitId}/timeline/${eventId}`, event);
  },

  // Delete timeline event
  deleteTimelineEvent: async (visitId: string, eventId: string) => {
    return api.delete(`/visits/${visitId}/timeline/${eventId}`);
  },

  // Get delay analysis
  getDelayAnalysis: async (visitId: string) => {
    return api.get(`/visits/${visitId}/delay-analysis`);
  },

  // Update delay analysis
  updateDelayAnalysis: async (visitId: string, analysis: {
    suggested_cause_codes?: string[];
    delay_breakdown?: Array<{
      phase: 'arrival' | 'assignment' | 'unloading' | 'completion';
      cause?: string;
    }>;
  }) => {
    return api.put(`/visits/${visitId}/delay-analysis`, analysis);
  },

  // Get visit summary for quick view
  getVisitSummary: async (visitId: string) => {
    return api.get(`/visits/${visitId}/summary`);
  },

  // Bulk operations
  bulkUpdateStatus: async (visitIds: string[], status: string, notes?: string) => {
    return api.post('/visits/bulk/status', { visit_ids: visitIds, status, notes });
  },

  bulkAssignRamp: async (visitIds: string[], ramp: string) => {
    return api.post('/visits/bulk/assign-ramp', { visit_ids: visitIds, ramp });
  },

  // Search visits
  searchVisits: async (query: string, filters?: {
    warehouse_id?: string;
    status?: string[];
    date_range?: { start: string; end: string };
    carrier_name?: string;
    trailer_plate?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    return api.get(`/visits/search?${params.toString()}`);
  },
};