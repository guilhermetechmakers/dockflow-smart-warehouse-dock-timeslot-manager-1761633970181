import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Truck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveBooking, DockStatus, CalendarTimeSlot } from '@/types/dashboard';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';

interface LiveCalendarGridProps {
  dockStatuses: DockStatus[];
  timeSlots: CalendarTimeSlot[];
  selectedDate: Date;
  onBookingClick?: (booking: LiveBooking) => void;
  onDockClick?: (dock: DockStatus) => void;
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'arrived':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'waiting':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'in_progress':
      return 'bg-coral-100 text-coral-800 border-coral-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'no_show':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-3 w-3" />;
    case 'confirmed':
      return <Truck className="h-3 w-3" />;
    case 'arrived':
      return <CheckCircle className="h-3 w-3" />;
    case 'waiting':
      return <Clock className="h-3 w-3" />;
    case 'in_progress':
      return <Truck className="h-3 w-3" />;
    case 'completed':
      return <CheckCircle className="h-3 w-3" />;
    case 'cancelled':
      return <XCircle className="h-3 w-3" />;
    case 'no_show':
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getTimeSlotStatus = (slot: CalendarTimeSlot) => {
  if (slot.status === 'booked' && slot.booking) {
    return slot.booking.status;
  }
  return slot.status;
};

const formatTime = (timeString: string) => {
  try {
    return format(parseISO(timeString), 'HH:mm');
  } catch {
    return timeString;
  }
};

const getDateLabel = (date: Date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM dd');
};

// Generate time slots for the day (6 AM to 10 PM)
const generateTimeSlots = (date: Date) => {
  const slots = [];
  const startHour = 6;
  const endHour = 22;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const minutes = quarter * 15;
      const time = new Date(date);
      time.setHours(hour, minutes, 0, 0);
      slots.push(time);
    }
  }
  
  return slots;
};

export function LiveCalendarGrid({
  dockStatuses,
  timeSlots,
  selectedDate,
  onBookingClick,
  onDockClick,
  className
}: LiveCalendarGridProps) {
  const timeSlotsForDay = generateTimeSlots(selectedDate);
  const dateLabel = getDateLabel(selectedDate);

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-dark">
            Live Schedule - {dateLabel}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {dockStatuses.length} Docks
            </Badge>
            <Badge variant="outline" className="text-xs">
              {timeSlots.filter(slot => slot.status === 'booked').length} Bookings
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header with dock names */}
            <div className="flex border-b border-gray-200">
              <div className="w-20 flex-shrink-0 p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </div>
              {dockStatuses.map((dock) => (
                <div
                  key={dock.id}
                  className="flex-1 min-w-32 p-3 text-center border-l border-gray-200"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-auto p-2 hover:bg-gray-50"
                    onClick={() => onDockClick?.(dock)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-dark">
                        {dock.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          dock.status === 'available' && 'bg-green-400',
                          dock.status === 'occupied' && 'bg-coral-500',
                          dock.status === 'maintenance' && 'bg-yellow-400',
                          dock.status === 'reserved' && 'bg-blue-400'
                        )} />
                        <span className="text-xs text-gray-500 capitalize">
                          {dock.status}
                        </span>
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="max-h-96 overflow-y-auto">
              {timeSlotsForDay.map((time, timeIndex) => (
                <div
                  key={timeIndex}
                  className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Time column */}
                  <div className="w-20 flex-shrink-0 p-2 text-xs text-gray-500 border-r border-gray-200">
                    {format(time, 'HH:mm')}
                  </div>

                  {/* Dock columns */}
                  {dockStatuses.map((dock) => {
                    const dockSlots = timeSlots.filter(
                      slot => slot.dock_id === dock.id
                    );
                    
                    const currentSlot = dockSlots.find(slot => {
                      const slotStart = parseISO(slot.start_time);
                      const slotEnd = parseISO(slot.end_time);
                      return time >= slotStart && time < slotEnd;
                    });

                    return (
                      <div
                        key={dock.id}
                        className="flex-1 min-w-32 p-1 border-l border-gray-200"
                      >
                        {currentSlot && (
                          <div
                            className={cn(
                              'p-2 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md',
                              getStatusColor(getTimeSlotStatus(currentSlot)),
                              'hover:scale-105'
                            )}
                            onClick={() => currentSlot.booking && onBookingClick?.(currentSlot.booking)}
                          >
                            {currentSlot.booking && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(currentSlot.booking.status)}
                                  <span className="text-xs font-medium truncate">
                                    {currentSlot.booking.carrier_name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                  {currentSlot.booking.trailer_plate}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs">
                                    {formatTime(currentSlot.start_time)} - {formatTime(currentSlot.end_time)}
                                  </span>
                                  {currentSlot.booking.priority === 'urgent' && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                      URGENT
                                    </Badge>
                                  )}
                                </div>
                                {currentSlot.booking.hazmat && (
                                  <div className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    <span className="text-xs text-red-600">HAZMAT</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}