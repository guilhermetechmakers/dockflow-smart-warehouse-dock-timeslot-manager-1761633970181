export interface Booking {
  id: string;
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
  status: BookingStatus;
  booking_token: string;
  modify_token?: string;
  cancel_token?: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'arrived'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Visit {
  id: string;
  booking_id: string;
  warehouse_id: string;
  dock_id: string;
  ramp_assignment?: string;
  status: BookingStatus;
  timeline: VisitEvent[];
  planned_start: string; // ISO datetime
  planned_end: string; // ISO datetime
  actual_start?: string; // ISO datetime
  actual_end?: string; // ISO datetime
  detention_minutes?: number;
  delay_minutes?: number;
  notes: string[];
  files: VisitFile[];
  created_at: string;
  updated_at: string;
}

export interface VisitEvent {
  id: string;
  visit_id: string;
  event_type: 'booked' | 'arrived' | 'assigned' | 'started' | 'completed' | 'cancelled';
  timestamp: string; // ISO datetime
  actor_id?: string; // User ID who performed the action
  actor_name?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface VisitFile {
  id: string;
  visit_id: string;
  filename: string;
  file_type: 'image' | 'document' | 'other';
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface CreateBookingInput {
  warehouse_id: string;
  dock_id: string;
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
}

export interface UpdateBookingInput {
  carrier_name?: string;
  trailer_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  eta?: string;
  pallets?: number;
  adr_declarations?: string[];
  temperature_controlled?: boolean;
  special_equipment?: string[];
  hazmat?: boolean;
  tailgate_required?: boolean;
}
