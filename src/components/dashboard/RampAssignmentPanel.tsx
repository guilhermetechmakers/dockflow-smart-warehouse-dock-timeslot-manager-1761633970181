import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Truck, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { LiveBooking, DockStatus } from '@/types/dashboard';

interface RampAssignmentPanelProps {
  bookings: LiveBooking[];
  dockStatuses: DockStatus[];
  onAssignRamp?: (bookingId: string, dockId: string, rampAssignment?: string) => void;
  onUpdatePriority?: (bookingId: string, priority: string) => void;
  className?: string;
}

interface AssignmentForm {
  bookingId: string;
  dockId: string;
  rampAssignment: string;
  priority: string;
  notes: string;
}

export function RampAssignmentPanel({
  bookings,
  dockStatuses,
  onAssignRamp,
  onUpdatePriority,
  className
}: RampAssignmentPanelProps) {
  const [selectedBooking, setSelectedBooking] = useState<LiveBooking | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    bookingId: '',
    dockId: '',
    rampAssignment: '',
    priority: 'medium',
    notes: ''
  });
  const [isAssigning, setIsAssigning] = useState(false);

  const availableDocks = dockStatuses.filter(dock => 
    dock.status === 'available' || dock.status === 'reserved'
  );

  const pendingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'arrived'
  );

  const handleBookingSelect = (booking: LiveBooking) => {
    setSelectedBooking(booking);
    setAssignmentForm({
      bookingId: booking.id,
      dockId: booking.dock_id,
      rampAssignment: booking.ramp_assignment || '',
      priority: booking.priority,
      notes: ''
    });
  };

  const handleAssignRamp = async () => {
    if (!selectedBooking || !assignmentForm.dockId) return;
    
    setIsAssigning(true);
    try {
      await onAssignRamp?.(
        assignmentForm.bookingId,
        assignmentForm.dockId,
        assignmentForm.rampAssignment
      );
      
      // Update priority if changed
      if (assignmentForm.priority !== selectedBooking.priority) {
        await onUpdatePriority?.(assignmentForm.bookingId, assignmentForm.priority);
      }
      
      // Reset form
      setSelectedBooking(null);
      setAssignmentForm({
        bookingId: '',
        dockId: '',
        rampAssignment: '',
        priority: 'medium',
        notes: ''
      });
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-coral-100 text-coral-800 border-coral-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDockStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-coral-100 text-coral-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Pending Bookings List */}
      <Card className="dockflow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-dark">
            Pending Assignments
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto">
            {pendingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-8 w-8 text-green-300 mb-2" />
                <p className="text-sm text-gray-500">All bookings assigned</p>
                <p className="text-xs text-gray-400">New bookings will appear here</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm',
                      'hover:bg-gray-50',
                      selectedBooking?.id === booking.id && 'ring-2 ring-coral-200 bg-coral-50'
                    )}
                    onClick={() => handleBookingSelect(booking)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-lg border',
                        getStatusColor(booking.status)
                      )}>
                        <Truck className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-dark truncate">
                            {booking.carrier_name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {booking.trailer_plate}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', getPriorityColor(booking.priority))}
                          >
                            {booking.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>Current: {booking.dock_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>
                              ETA: {new Date(booking.eta).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {booking.hazmat && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span>HAZMAT</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Form */}
      {selectedBooking && (
        <Card className="dockflow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-dark">
              Assign Ramp
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Selected Booking Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-dark">
                  {selectedBooking.carrier_name} - {selectedBooking.trailer_plate}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {selectedBooking.pallets} pallets • {selectedBooking.adr_declarations.join(', ')}
              </div>
            </div>

            {/* Dock Selection */}
            <div className="space-y-2">
              <Label htmlFor="dock-select" className="text-sm font-medium text-dark">
                Select Dock
              </Label>
              <Select
                value={assignmentForm.dockId}
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, dockId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dock" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocks.map((dock) => (
                    <SelectItem key={dock.id} value={dock.id}>
                      <div className="flex items-center gap-2">
                        <span>{dock.name}</span>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getDockStatusColor(dock.status))}
                        >
                          {dock.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ramp Assignment */}
            <div className="space-y-2">
              <Label htmlFor="ramp-assignment" className="text-sm font-medium text-dark">
                Ramp Assignment (Optional)
              </Label>
              <input
                id="ramp-assignment"
                type="text"
                value={assignmentForm.rampAssignment}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, rampAssignment: e.target.value }))}
                placeholder="e.g., Ramp A, Bay 1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              />
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label htmlFor="priority-select" className="text-sm font-medium text-dark">
                Priority
              </Label>
              <Select
                value={assignmentForm.priority}
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAssignRamp}
                disabled={!assignmentForm.dockId || isAssigning}
                className="flex-1 bg-coral-500 hover:bg-coral-600 text-white"
              >
                {isAssigning ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Assign Ramp
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedBooking(null)}
                disabled={isAssigning}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}