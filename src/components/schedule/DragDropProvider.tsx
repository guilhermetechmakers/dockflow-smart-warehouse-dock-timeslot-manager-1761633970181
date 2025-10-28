import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ScheduleBooking, ScheduleSlot } from '@/types/schedule';

interface DragDropContextType {
  draggedBooking: ScheduleBooking | null;
  draggedSlot: ScheduleSlot | null;
  dragOverSlot: string | null;
  setDraggedBooking: (booking: ScheduleBooking | null) => void;
  setDraggedSlot: (slot: ScheduleSlot | null) => void;
  setDragOverSlot: (slotId: string | null) => void;
  onBookingDrop: (booking: ScheduleBooking, targetSlotId: string) => void;
  onSlotDrop: (slot: ScheduleSlot, targetSlotId: string) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

interface DragDropProviderProps {
  children: React.ReactNode;
  onBookingReschedule?: (bookingId: string, newSlotId: string) => void;
  onSlotMove?: (slotId: string, newSlotId: string) => void;
}

export function DragDropProvider({ 
  children, 
  onBookingReschedule,
  onSlotMove 
}: DragDropProviderProps) {
  const [draggedBooking, setDraggedBooking] = useState<ScheduleBooking | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<ScheduleSlot | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const handleBookingDrop = useCallback((booking: ScheduleBooking, targetSlotId: string) => {
    if (onBookingReschedule) {
      onBookingReschedule(booking.id, targetSlotId);
    }
    setDraggedBooking(null);
    setDragOverSlot(null);
  }, [onBookingReschedule]);

  const handleSlotDrop = useCallback((slot: ScheduleSlot, targetSlotId: string) => {
    if (onSlotMove) {
      onSlotMove(slot.id, targetSlotId);
    }
    setDraggedSlot(null);
    setDragOverSlot(null);
  }, [onSlotMove]);

  const value: DragDropContextType = {
    draggedBooking,
    draggedSlot,
    dragOverSlot,
    setDraggedBooking,
    setDraggedSlot,
    setDragOverSlot,
    onBookingDrop: handleBookingDrop,
    onSlotDrop: handleSlotDrop,
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
}