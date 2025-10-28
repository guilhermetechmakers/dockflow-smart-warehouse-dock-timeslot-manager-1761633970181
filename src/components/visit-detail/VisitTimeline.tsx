import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Truck,
  MapPin,
  Play
} from 'lucide-react';
import type { VisitEvent } from '@/types/booking';

interface VisitTimelineProps {
  events: VisitEvent[];
  isLoading?: boolean;
  onAddEvent?: () => void;
  canAddEvents?: boolean;
}

const eventIcons = {
  booked: Clock,
  arrived: Truck,
  assigned: MapPin,
  started: Play,
  completed: CheckCircle,
  cancelled: XCircle,
};

const eventColors = {
  booked: 'bg-blue-100 text-blue-800',
  arrived: 'bg-green-100 text-green-800',
  assigned: 'bg-purple-100 text-purple-800',
  started: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const eventLabels = {
  booked: 'Booked',
  arrived: 'Arrived',
  assigned: 'Assigned',
  started: 'Started',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function VisitTimeline({ 
  events, 
  isLoading = false, 
  onAddEvent,
  canAddEvents = false 
}: VisitTimelineProps) {
  if (isLoading) {
    return (
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-coral-500" />
            Visit Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-coral-500" />
            Visit Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No timeline events yet</p>
            {canAddEvents && onAddEvent && (
              <Button onClick={onAddEvent} variant="outline" size="sm">
                Add Event
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort events by timestamp
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Card className="dockflow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-coral-500" />
            Visit Timeline
          </CardTitle>
          {canAddEvents && onAddEvent && (
            <Button onClick={onAddEvent} variant="outline" size="sm">
              Add Event
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedEvents.map((event, index) => {
            const Icon = eventIcons[event.event_type];
            const isLast = index === sortedEvents.length - 1;
            
            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200" />
                )}
                
                {/* Event icon */}
                <div className={`
                  relative z-10 flex h-8 w-8 items-center justify-center rounded-full
                  ${eventColors[event.event_type]}
                  shadow-sm
                `}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={eventColors[event.event_type]}
                    >
                      {eventLabels[event.event_type]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  {event.actor_name && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                      <User className="h-3 w-3" />
                      <span>{event.actor_name}</span>
                    </div>
                  )}
                  
                  {event.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-2">
                      {event.notes}
                    </p>
                  )}
                  
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-700">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}