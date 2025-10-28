export interface Dock {
  id: string;
  name: string;
  location: string;
  capacity: number;
  capabilities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Carrier {
  id: string;
  name: string;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CargoType {
  id: string;
  description: string;
  category: string;
  requires_adr: boolean;
  temperature_controlled: boolean;
  special_handling: string[];
  created_at: string;
  updated_at: string;
}

export interface SlotRule {
  id: string;
  dock_id: string;
  name: string;
  duration_minutes: number;
  buffer_minutes: number;
  capacity: number;
  overbooking_policy: 'none' | 'limited' | 'unlimited';
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  recurrence_days?: number[]; // 0-6 for weekly, 1-31 for monthly
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleSlot {
  id: string;
  dock_id: string;
  slot_rule_id?: string;
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  capacity: number;
  available_capacity: number;
  bookings: ScheduleBooking[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleBooking {
  id: string;
  booking_id: string;
  visit_id?: string;
  carrier_id: string;
  carrier_name: string;
  trailer_plate: string;
  driver_name?: string;
  driver_phone?: string;
  driver_email?: string;
  eta: string; // ISO datetime
  pallets: number;
  adr_declarations: string[];
  temperature_controlled: boolean;
  special_equipment: string[];
  hazmat: boolean;
  tailgate_required: boolean;
  status: BookingStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string[];
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

export interface ScheduleFilter {
  dock_ids?: string[];
  carrier_ids?: string[];
  cargo_types?: string[];
  statuses?: BookingStatus[];
  adr_required?: boolean;
  temperature_controlled?: boolean;
  hazmat?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ScheduleViewMode {
  type: 'day' | 'week' | 'month' | 'list';
  date: string; // ISO date string
}

export interface ScheduleConflict {
  id: string;
  type: 'overlap' | 'capacity_exceeded' | 'rule_violation';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affected_bookings: string[];
  suggested_resolutions: ConflictResolution[];
  created_at: string;
}

export interface ConflictResolution {
  id: string;
  type: 'reschedule' | 'reassign_dock' | 'split_booking' | 'extend_capacity';
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimated_delay_minutes?: number;
  affected_bookings: string[];
}

export interface ScheduleExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  date_range: {
    start: string;
    end: string;
  };
  include_details: boolean;
  include_conflicts: boolean;
  group_by?: 'dock' | 'carrier' | 'date' | 'status';
}

export interface ScheduleStats {
  total_bookings: number;
  total_slots: number;
  utilization_percentage: number;
  average_detention_minutes: number;
  on_time_percentage: number;
  conflict_count: number;
  upcoming_arrivals: number;
}

export interface CreateSlotRuleInput {
  dock_id: string;
  name: string;
  duration_minutes: number;
  buffer_minutes: number;
  capacity: number;
  overbooking_policy: 'none' | 'limited' | 'unlimited';
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  recurrence_days?: number[];
  start_time: string;
  end_time: string;
}

export interface UpdateSlotRuleInput {
  name?: string;
  duration_minutes?: number;
  buffer_minutes?: number;
  capacity?: number;
  overbooking_policy?: 'none' | 'limited' | 'unlimited';
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  recurrence_days?: number[];
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface RescheduleBookingInput {
  booking_id: string;
  new_dock_id?: string;
  new_start_time: string;
  new_end_time: string;
  reason?: string;
  notify_carrier?: boolean;
}