import type { Visit, VisitEvent, VisitFile, BookingStatus } from './booking';

export interface VisitDetail extends Omit<Visit, 'notes'> {
  booking: {
    id: string;
    carrier_name: string;
    trailer_plate: string;
    driver_name?: string;
    driver_phone?: string;
    driver_email?: string;
    eta: string;
    pallets: number;
    adr_declarations: string[];
    temperature_controlled?: boolean;
    special_equipment: string[];
    hazmat: boolean;
    tailgate_required: boolean;
  };
  warehouse: {
    id: string;
    name: string;
    address: string;
  };
  dock: {
    id: string;
    name: string;
    number: string;
  };
  delay_analysis: DelayAnalysis;
  disputes: Dispute[];
  cause_codes: CauseCode[];
  notes: VisitNote[];
}

export interface DelayAnalysis {
  planned_duration_minutes: number;
  actual_duration_minutes?: number;
  delay_minutes?: number;
  detention_minutes?: number;
  variance_percentage?: number;
  suggested_cause_codes: string[];
  delay_breakdown: DelayBreakdown[];
}

export interface DelayBreakdown {
  phase: 'arrival' | 'assignment' | 'unloading' | 'completion';
  planned_minutes: number;
  actual_minutes?: number;
  delay_minutes?: number;
  cause?: string;
}

export interface CauseCode {
  id: string;
  code: string;
  description: string;
  category: 'carrier' | 'warehouse' | 'external' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_suggested: boolean;
}

export interface Dispute {
  id: string;
  visit_id: string;
  dispute_type: 'billing' | 'service' | 'delay' | 'damage' | 'other';
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  reason: string;
  description: string;
  amount_disputed?: number;
  currency?: string;
  created_by: string;
  created_at: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  supporting_files: string[];
}

export interface CreateDisputeInput {
  dispute_type: 'billing' | 'service' | 'delay' | 'damage' | 'other';
  reason: string;
  description: string;
  amount_disputed?: number;
  currency?: string;
  supporting_files?: string[];
}

export interface UpdateDisputeInput {
  status?: 'open' | 'in_review' | 'resolved' | 'closed';
  resolution_notes?: string;
}

export interface VisitNote {
  id: string;
  visit_id: string;
  content: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  is_internal: boolean;
  tags: string[];
}

export interface CreateVisitNoteInput {
  content: string;
  is_internal?: boolean;
  tags?: string[];
}

export interface VisitExport {
  visit_id: string;
  export_type: 'pdf' | 'csv' | 'excel';
  download_url: string;
  expires_at: string;
  created_at: string;
}

export interface VisitDetailFilters {
  include_notes?: boolean;
  include_files?: boolean;
  include_disputes?: boolean;
  include_delay_analysis?: boolean;
  note_types?: ('internal' | 'external')[];
  file_types?: ('image' | 'document' | 'other')[];
  dispute_status?: ('open' | 'in_review' | 'resolved' | 'closed')[];
}

export interface VisitDetailStats {
  total_events: number;
  total_files: number;
  total_notes: number;
  total_disputes: number;
  open_disputes: number;
  avg_delay_minutes: number;
  max_delay_minutes: number;
  detention_cost?: number;
  currency?: string;
}

// Re-export types from booking for convenience
export type { Visit, VisitEvent, VisitFile, BookingStatus };