export interface Warehouse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  timezone: string;
  operating_hours: OperatingHours;
  contact_phone?: string;
  contact_email?: string;
  public_booking_link?: string;
  created_at: string;
  updated_at: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  is_open: boolean;
  open_time?: string; // HH:MM format
  close_time?: string; // HH:MM format
}

export interface Dock {
  id: string;
  warehouse_id: string;
  name: string;
  number: string;
  coordinates?: {
    x: number;
    y: number;
  };
  capabilities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotRule {
  id: string;
  warehouse_id: string;
  dock_id?: string;
  duration_minutes: number;
  buffer_minutes: number;
  capacity: number;
  overbooking_policy: 'none' | 'limited' | 'unlimited';
  allowed_cargo_types: string[];
  created_at: string;
  updated_at: string;
}
