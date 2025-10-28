import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Truck, 
  AlertTriangle,
  Thermometer,
  Flame
} from 'lucide-react';
import { useDragDrop } from './DragDropProvider';
import type { ScheduleBooking } from '@/types/schedule';

interface DraggableBookingProps {
  booking: ScheduleBooking;
  onBookingClick?: (booking: ScheduleBooking) => void;
  className?: string;
}

export function DraggableBooking({ 
  booking, 
  onBookingClick,
  className 
}: DraggableBookingProps) {
  const { draggedBooking, setDraggedBooking } = useDragDrop();

  const handleDragStart = (e: React.DragEvent) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', booking.id);
  };

  const handleDragEnd = () => {
    setDraggedBooking(null);
  };

  const handleClick = () => {
    onBookingClick?.(booking);
  };

  const isDragging = draggedBooking?.id === booking.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'normal':
        return 'border-l-blue-500';
      case 'low':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={cn(
        "p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md",
        "bg-white border-gray-200 hover:border-coral-300 hover:bg-coral-50",
        getPriorityColor(booking.priority),
        isDragging && "opacity-50 scale-95",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-coral-500" />
          <span className="font-medium text-dark">{booking.carrier_name}</span>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getStatusColor(booking.status))}
          >
            {booking.status}
          </Badge>
        </div>
        <div className="text-sm text-gray-500">
          {booking.trailer_plate}
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ETA: {format(new Date(booking.eta), 'HH:mm')}
          </div>
          <div>
            {booking.pallets} pallets
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {booking.hazmat && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <Flame className="h-3 w-3" />
              HAZMAT
            </Badge>
          )}
          {booking.temperature_controlled && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              Temp Controlled
            </Badge>
          )}
          {booking.adr_declarations.length > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              ADR
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}