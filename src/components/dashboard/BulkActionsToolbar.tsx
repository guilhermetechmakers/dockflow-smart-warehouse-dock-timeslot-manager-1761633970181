import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Bell, 
  XCircle,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { LiveBooking, BulkAction } from '@/types/dashboard';

interface BulkActionsToolbarProps {
  bookings: LiveBooking[];
  selectedBookings: string[];
  onSelectionChange: (bookingIds: string[]) => void;
  onBulkAction: (actionId: string, bookingIds: string[], parameters?: Record<string, any>) => void;
  className?: string;
}

const bulkActions: BulkAction[] = [
  {
    id: 'reassign',
    label: 'Reassign Docks',
    icon: 'MapPin',
    action: 'reassign',
    requires_selection: true,
    confirmation_required: true,
    confirmation_message: 'Are you sure you want to reassign the selected bookings to different docks?'
  },
  {
    id: 'reschedule',
    label: 'Reschedule',
    icon: 'Clock',
    action: 'reschedule',
    requires_selection: true,
    confirmation_required: true,
    confirmation_message: 'Are you sure you want to reschedule the selected bookings?'
  },
  {
    id: 'notify',
    label: 'Send Notification',
    icon: 'Bell',
    action: 'notify',
    requires_selection: true,
    confirmation_required: false
  },
  {
    id: 'priority_change',
    label: 'Change Priority',
    icon: 'AlertTriangle',
    action: 'priority_change',
    requires_selection: true,
    confirmation_required: false
  },
  {
    id: 'cancel',
    label: 'Cancel Bookings',
    icon: 'XCircle',
    action: 'cancel',
    requires_selection: true,
    confirmation_required: true,
    confirmation_message: 'Are you sure you want to cancel the selected bookings? This action cannot be undone.'
  }
];

const getActionIcon = (iconName: string) => {
  switch (iconName) {
    case 'MapPin':
      return <MapPin className="h-4 w-4" />;
    case 'Clock':
      return <Clock className="h-4 w-4" />;
    case 'Bell':
      return <Bell className="h-4 w-4" />;
    case 'AlertTriangle':
      return <AlertTriangle className="h-4 w-4" />;
    case 'XCircle':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

export function BulkActionsToolbar({
  bookings,
  selectedBookings,
  onSelectionChange,
  onBulkAction,
  className
}: BulkActionsToolbarProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionParameters, setActionParameters] = useState<Record<string, any>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    actionId: string;
    bookingIds: string[];
    parameters?: Record<string, any>;
  } | null>(null);

  const selectedCount = selectedBookings.length;
  const totalCount = bookings.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(bookings.map(booking => booking.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedBookings, bookingId]);
    } else {
      onSelectionChange(selectedBookings.filter(id => id !== bookingId));
    }
  };

  const handleBulkAction = (actionId: string) => {
    const action = bulkActions.find(a => a.id === actionId);
    if (!action) return;

    const parameters = { ...actionParameters };
    
    // Add action-specific parameters
    if (actionId === 'priority_change') {
      parameters.priority = actionParameters.priority || 'medium';
    } else if (actionId === 'reassign') {
      parameters.dock_id = actionParameters.dock_id;
    } else if (actionId === 'reschedule') {
      parameters.new_time = actionParameters.new_time;
    }

    if (action.confirmation_required) {
      setPendingAction({ actionId, bookingIds: selectedBookings, parameters });
      setShowConfirmation(true);
    } else {
      onBulkAction(actionId, selectedBookings, parameters);
      setSelectedAction('');
      setActionParameters({});
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      onBulkAction(pendingAction.actionId, pendingAction.bookingIds, pendingAction.parameters);
      setPendingAction(null);
    }
    setShowConfirmation(false);
    setSelectedAction('');
    setActionParameters({});
  };

  const cancelAction = () => {
    setPendingAction(null);
    setShowConfirmation(false);
    setSelectedAction('');
    setActionParameters({});
  };

  if (totalCount === 0) {
    return null;
  }

  return (
    <>
      <Card className={cn('dockflow-card', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Selection Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium text-dark">
                  Select All ({totalCount})
                </label>
              </div>

              {selectedCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedCount} selected
                </Badge>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-3">
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bulkActions.map((action) => (
                      <SelectItem key={action.id} value={action.id}>
                        <div className="flex items-center gap-2">
                          {getActionIcon(action.icon)}
                          <span>{action.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Action Parameters */}
                {selectedAction === 'priority_change' && (
                  <Select
                    value={actionParameters.priority || 'medium'}
                    onValueChange={(value) => setActionParameters(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {selectedAction === 'reassign' && (
                  <Select
                    value={actionParameters.dock_id || ''}
                    onValueChange={(value) => setActionParameters(prev => ({ ...prev, dock_id: value }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select dock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dock-1">Dock 1</SelectItem>
                      <SelectItem value="dock-2">Dock 2</SelectItem>
                      <SelectItem value="dock-3">Dock 3</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <Button
                  onClick={() => handleBulkAction(selectedAction)}
                  disabled={!selectedAction || (selectedAction === 'reassign' && !actionParameters.dock_id)}
                  className="bg-coral-500 hover:bg-coral-600 text-white"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Execute
                </Button>
              </div>
            )}
          </div>

          {/* Individual Booking Selection */}
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <Checkbox
                  id={`booking-${booking.id}`}
                  checked={selectedBookings.includes(booking.id)}
                  onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark truncate">
                      {booking.carrier_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {booking.trailer_plate}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        booking.priority === 'urgent' && 'border-red-300 text-red-600',
                        booking.priority === 'high' && 'border-orange-300 text-orange-600',
                        booking.priority === 'medium' && 'border-yellow-300 text-yellow-600',
                        booking.priority === 'low' && 'border-green-300 text-green-600'
                      )}
                    >
                      {booking.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {booking.dock_name} • {booking.pallets} pallets
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && bulkActions.find(a => a.id === pendingAction.actionId)?.confirmation_message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="bg-coral-500 hover:bg-coral-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}