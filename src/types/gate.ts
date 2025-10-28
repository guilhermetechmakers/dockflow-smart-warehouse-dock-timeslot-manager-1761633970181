export interface GateCheckIn {
  id: string;
  booking_id: string;
  visit_id: string;
  warehouse_id: string;
  dock_id: string;
  carrier_name: string;
  trailer_plate: string;
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  eta: string; // ISO datetime
  pallets: number;
  adr_declarations: string[];
  temperature_controlled?: boolean;
  special_equipment: string[];
  hazmat: boolean;
  tailgate_required: boolean;
  status: GateStatus;
  ramp_assignment?: string;
  qr_code?: string;
  booking_token: string;
  created_at: string;
  updated_at: string;
}

export type GateStatus = 
  | 'pending'
  | 'arrived'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface GateEvent {
  id: string;
  gate_check_in_id: string;
  event_type: 'scanned' | 'arrived' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'ramp_assigned' | 'note_added' | 'photo_captured' | 'document_uploaded';
  timestamp: string; // ISO datetime
  actor_id?: string; // User ID who performed the action
  actor_name?: string;
  notes?: string;
  metadata?: Record<string, any>;
  file_url?: string;
  file_type?: 'image' | 'document' | 'other';
}

export interface QRScanResult {
  booking_id: string;
  booking_token: string;
  visit_id?: string;
  valid: boolean;
  expires_at?: string;
}

export interface PlateLookupResult {
  booking_id?: string;
  booking_token?: string;
  visit_id?: string;
  valid: boolean;
  matches: BookingMatch[];
}

export interface BookingMatch {
  booking_id: string;
  booking_token: string;
  visit_id?: string;
  carrier_name: string;
  trailer_plate: string;
  eta: string;
  status: GateStatus;
  confidence: number; // 0-1
}

export interface RampAssignment {
  id: string;
  name: string;
  dock_id: string;
  status: 'available' | 'occupied' | 'maintenance';
  current_booking_id?: string;
  priority: number;
}

export interface GateCheckInUpdate {
  status?: GateStatus;
  ramp_assignment?: string;
  notes?: string;
  photos?: File[];
  documents?: File[];
}

export interface OfflineEvent {
  id: string;
  event_type: string;
  data: any;
  timestamp: string;
  retry_count: number;
  max_retries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface GateDeviceInfo {
  device_id: string;
  device_name: string;
  location: string;
  last_sync: string;
  is_online: boolean;
  battery_level?: number;
  signal_strength?: number;
}

// API Response types
export interface GateCheckInResponse {
  success: boolean;
  data?: GateCheckIn;
  error?: string;
}

export interface QRScanResponse {
  success: boolean;
  data?: QRScanResult;
  error?: string;
}

export interface PlateLookupResponse {
  success: boolean;
  data?: PlateLookupResult;
  error?: string;
}

export interface StatusUpdateResponse {
  success: boolean;
  data?: {
    visit_id: string;
    status: GateStatus;
    timestamp: string;
    event_id: string;
  };
  error?: string;
}

export interface RampAssignmentResponse {
  success: boolean;
  data?: {
    visit_id: string;
    ramp: string;
    assigned_at: string;
  };
  error?: string;
}

export interface FileUploadResponse {
  success: boolean;
  data?: {
    file_id: string;
    file_url: string;
    file_type: string;
  };
  error?: string;
}

// Form validation schemas
export interface ManualEntryForm {
  plate_number: string;
  carrier_name?: string;
  booking_reference?: string;
}

export interface NotesForm {
  note: string;
  priority: 'low' | 'medium' | 'high';
  category: 'general' | 'delay' | 'issue' | 'observation';
}

export interface RampAssignmentForm {
  ramp_id: string;
  priority: 'normal' | 'urgent' | 'express';
  notes?: string;
}