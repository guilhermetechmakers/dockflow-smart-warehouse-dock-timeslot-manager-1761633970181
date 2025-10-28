import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { DraggableBooking } from './DraggableBooking';
import { DropZone } from './DropZone';
import type { ScheduleSlot, ScheduleBooking, Dock } from '@/types/schedule';

interface CalendarViewProps {
  viewMode: 'day' | 'week' | 'month' | 'list';
  currentDate: Date;
  slots: ScheduleSlot[];
  docks: Dock[];
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'day' | 'week' | 'month' | 'list') => void;
  onBookingClick?: (booking: ScheduleBooking) => void;
  onSlotClick?: (slot: ScheduleSlot) => void;
  className?: string;
}

export function CalendarView({
  viewMode,
  currentDate,
  slots,
  docks,
  onDateChange,
  onViewModeChange,
  onBookingClick,
  onSlotClick,
  className,
}: CalendarViewProps) {
  const renderDayView = () => {
    const daySlots = slots.filter(slot => 
      isSameDay(new Date(slot.start_time), currentDate)
    );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {docks.map(dock => {
            const dockSlots = daySlots.filter(slot => slot.dock_id === dock.id);
            
            return (
              <Card key={dock.id} className="dockflow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-coral-500" />
                      <h3 className="font-semibold text-dark">{dock.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {dock.capacity} slots
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {dockSlots.length} bookings
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dockSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No bookings for this dock today
                      </div>
                    ) : (
                      dockSlots.map(slot => (
                        <div key={slot.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                            </span>
                            <span>
                              {slot.available_capacity}/{slot.capacity} available
                            </span>
                          </div>
                          
                          <DropZone slotId={slot.id}>
                            <div className="space-y-1">
                              {slot.bookings.map(booking => (
                                <DraggableBooking
                                  key={booking.id}
                                  booking={booking}
                                  onBookingClick={onBookingClick}
                                />
                              ))}
                            </div>
                          </DropZone>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const daySlots = slots.filter(slot => 
              isSameDay(new Date(slot.start_time), day)
            );
            
            return (
              <Card key={day.toISOString()} className="dockflow-card">
                <CardContent className="p-3">
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-gray-500">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-lg font-bold text-dark">
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {daySlots.slice(0, 3).map(slot => (
                      <div
                        key={slot.id}
                        className="p-2 bg-coral-50 border border-coral-200 rounded text-xs cursor-pointer hover:bg-coral-100 transition-colors"
                        onClick={() => onSlotClick?.(slot)}
                      >
                        <div className="font-medium text-coral-700">
                          {format(new Date(slot.start_time), 'HH:mm')}
                        </div>
                        <div className="text-coral-600">
                          {slot.bookings.length} bookings
                        </div>
                      </div>
                    ))}
                    
                    {daySlots.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{daySlots.length - 3} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Add days from previous/next month to fill the grid
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {/* Header */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map(day => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(day, new Date());
            const daySlots = slots.filter(slot => 
              isSameDay(new Date(slot.start_time), day)
            );
            
            return (
              <Card
                key={day.toISOString()}
                className={cn(
                  "dockflow-card min-h-[100px] cursor-pointer transition-all duration-200 hover:shadow-md",
                  !isCurrentMonth && "opacity-50",
                  isToday && "ring-2 ring-coral-500"
                )}
                onClick={() => onDateChange(day)}
              >
                <CardContent className="p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-sm font-medium",
                      isToday ? "text-coral-500" : "text-dark"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {daySlots.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {daySlots.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {daySlots.slice(0, 2).map(slot => (
                      <div
                        key={slot.id}
                        className="p-1 bg-coral-50 border border-coral-200 rounded text-xs"
                      >
                        <div className="font-medium text-coral-700">
                          {format(new Date(slot.start_time), 'HH:mm')}
                        </div>
                        <div className="text-coral-600 truncate">
                          {slot.bookings.length} bookings
                        </div>
                      </div>
                    ))}
                    
                    {daySlots.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{daySlots.length - 2}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const sortedSlots = [...slots].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedSlots.map(slot => {
          const dock = docks.find(d => d.id === slot.dock_id);
          
          return (
            <Card key={slot.id} className="dockflow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-coral-500" />
                    <span className="font-semibold text-dark">{dock?.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(slot.start_time), 'MMM d, yyyy')}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {slot.available_capacity}/{slot.capacity} available
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {slot.bookings.length} bookings
                  </Badge>
                </div>
                
                <DropZone slotId={slot.id}>
                  <div className="space-y-2">
                    {slot.bookings.map(booking => (
                      <DraggableBooking
                        key={booking.id}
                        booking={booking}
                        onBookingClick={onBookingClick}
                      />
                    ))}
                  </div>
                </DropZone>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'list':
        return renderListView();
      default:
        return renderDayView();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-dark">
            {format(currentDate, 'MMMM d, yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(subDays(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(addDays(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month', 'list'] as const).map(mode => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange(mode)}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="animate-fade-in">
        {renderView()}
      </div>
    </div>
  );
}