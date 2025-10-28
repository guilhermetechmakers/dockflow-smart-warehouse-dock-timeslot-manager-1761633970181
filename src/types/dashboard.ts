export interface DashboardKPI {
  id: string;
  title: string;
  value: number | string;
  change: number; // percentage change from previous period
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: 'coral' | 'green' | 'yellow' | 'blue' | 'gray';
  format: 'number' | 'percentage' | 'currency' | 'time';
  description?: string;
}

export interface LiveBooking {
  id: string;
  booking_id: string;
  carrier_name: string;
  trailer_plate: string;
  dock_id: string;
  dock_name: string;
  status: BookingStatus;
  eta: string;
  actual_arrival?: string;
  pallets: number;
  adr_declarations: string[];
  temperature_controlled: boolean;
  hazmat: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  delay_minutes?: number;
  detention_minutes?: number;
  ramp_assignment?: string;
  notes: string[];
  created_at: string;
  updated_at: string;
}

export interface DockStatus {
  id: string;
  name: string;
  number: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  current_booking?: LiveBooking;
  next_booking?: LiveBooking;
  utilization_percentage: number;
  avg_processing_time: number; // in minutes
  coordinates?: {
    x: number;
    y: number;
  };
}

export interface ActivityNotification {
  id: string;
  type: 'arrival' | 'delay' | 'completion' | 'conflict' | 'system' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  is_read: boolean;
  action_required: boolean;
  related_booking_id?: string;
  related_dock_id?: string;
  metadata?: Record<string, any>;
}

export interface WarehouseYard {
  id: string;
  name: string;
  width: number;
  height: number;
  docks: DockStatus[];
  gates: GateLocation[];
  scale: number; // pixels per meter
}

export interface GateLocation {
  id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
  };
  is_active: boolean;
  current_queue: number;
}

export interface CalendarTimeSlot {
  id: string;
  dock_id: string;
  start_time: string;
  end_time: string;
  booking?: LiveBooking;
  status: 'available' | 'booked' | 'blocked' | 'maintenance';
  capacity: number;
  buffer_minutes: number;
}

export interface DashboardFilters {
  warehouse_id?: string;
  date_range: {
    start: string;
    end: string;
  };
  dock_ids?: string[];
  status_filter?: BookingStatus[];
  carrier_filter?: string[];
  priority_filter?: string[];
  show_only_delays?: boolean;
  show_only_hazmat?: boolean;
}

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  action: 'reassign' | 'reschedule' | 'notify' | 'cancel' | 'priority_change';
  requires_selection: boolean;
  confirmation_required: boolean;
  confirmation_message?: string;
}

export interface DashboardStats {
  total_bookings_today: number;
  on_time_percentage: number;
  avg_detention_minutes: number;
  dock_utilization: number;
  active_delays: number;
  hazmat_bookings: number;
  temperature_controlled_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
}

export interface RealTimeUpdate {
  type: 'booking_update' | 'dock_status_change' | 'notification' | 'kpi_update';
  data: any;
  timestamp: string;
  warehouse_id: string;
}

export interface DashboardSettings {
  refresh_interval: number; // seconds
  auto_refresh: boolean;
  notifications_enabled: boolean;
  sound_alerts: boolean;
  default_view: 'calendar' | 'list' | 'map';
  time_format: '12h' | '24h';
  date_range_days: number;
}

// Import and re-export BookingStatus from booking.ts for convenience
import type { BookingStatus } from './booking';
export type { BookingStatus };