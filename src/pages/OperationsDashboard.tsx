import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  MapPin, 
  Settings, 
  RefreshCw,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';

// Dashboard Components
import { KPICard } from '@/components/dashboard/KPICard';
import { LiveCalendarGrid } from '@/components/dashboard/LiveCalendarGrid';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { GateCheckInWidget } from '@/components/dashboard/GateCheckInWidget';
import { RampAssignmentPanel } from '@/components/dashboard/RampAssignmentPanel';
import { BulkActionsToolbar } from '@/components/dashboard/BulkActionsToolbar';

// Hooks
import { 
  useDashboardKPIs, 
  useLiveBookings, 
  useDockStatuses, 
  useNotifications,
  useMarkAllNotificationsAsRead,
  useAssignDock,
  useUpdateBookingStatus,
  useExecuteBulkAction
} from '@/hooks/useDashboard';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

// Types
import type { DashboardKPI, LiveBooking, DockStatus, ActivityNotification, DashboardFilters } from '@/types/dashboard';

export function OperationsDashboard() {
  // State
  const [selectedWarehouse, setSelectedWarehouse] = useState('warehouse-1');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'map'>('calendar');
  const [, setSelectedBooking] = useState<LiveBooking | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    warehouse_id: selectedWarehouse,
    date_range: {
      start: startOfDay(selectedDate).toISOString(),
      end: endOfDay(selectedDate).toISOString(),
    },
  });

  // Mock data for demonstration
  const mockKPIs: DashboardKPI[] = [
    {
      id: '1',
      title: 'Total Bookings Today',
      value: 24,
      change: 12.5,
      changeType: 'increase',
      trend: 'up',
      icon: 'truck',
      color: 'coral',
      format: 'number',
      description: 'Compared to yesterday'
    },
    {
      id: '2',
      title: 'On-Time Rate',
      value: 87.5,
      change: -2.3,
      changeType: 'decrease',
      trend: 'down',
      icon: 'clock',
      color: 'green',
      format: 'percentage',
      description: 'Last 24 hours'
    },
    {
      id: '3',
      title: 'Avg Detention',
      value: 45,
      change: -8.2,
      changeType: 'decrease',
      trend: 'up',
      icon: 'bar-chart',
      color: 'blue',
      format: 'time',
      description: 'Minutes per visit'
    },
    {
      id: '4',
      title: 'Dock Utilization',
      value: 78.3,
      change: 5.1,
      changeType: 'increase',
      trend: 'up',
      icon: 'check-circle',
      color: 'yellow',
      format: 'percentage',
      description: 'Current capacity'
    }
  ];

  const mockBookings: LiveBooking[] = [
    {
      id: '1',
      booking_id: 'BK001',
      carrier_name: 'ABC Transport',
      trailer_plate: 'ABC-1234',
      dock_id: 'dock-1',
      dock_name: 'Dock 1',
      status: 'arrived',
      eta: new Date().toISOString(),
      actual_arrival: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      pallets: 24,
      adr_declarations: ['General Freight'],
      temperature_controlled: false,
      hazmat: false,
      priority: 'medium',
      delay_minutes: 15,
      detention_minutes: 0,
      ramp_assignment: 'Ramp A',
      notes: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      booking_id: 'BK002',
      carrier_name: 'XYZ Logistics',
      trailer_plate: 'XYZ-5678',
      dock_id: 'dock-2',
      dock_name: 'Dock 2',
      status: 'in_progress',
      eta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      pallets: 32,
      adr_declarations: ['Hazmat Class 3'],
      temperature_controlled: true,
      hazmat: true,
      priority: 'high',
      delay_minutes: 0,
      detention_minutes: 120,
      ramp_assignment: 'Ramp B',
      notes: ['Temperature controlled cargo'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const mockDockStatuses: DockStatus[] = [
    {
      id: 'dock-1',
      name: 'Dock 1',
      number: '1',
      status: 'occupied',
      current_booking: mockBookings[0],
      utilization_percentage: 85,
      avg_processing_time: 120,
      coordinates: { x: 100, y: 200 }
    },
    {
      id: 'dock-2',
      name: 'Dock 2',
      number: '2',
      status: 'occupied',
      current_booking: mockBookings[1],
      utilization_percentage: 90,
      avg_processing_time: 150,
      coordinates: { x: 300, y: 200 }
    },
    {
      id: 'dock-3',
      name: 'Dock 3',
      number: '3',
      status: 'available',
      utilization_percentage: 45,
      avg_processing_time: 100,
      coordinates: { x: 500, y: 200 }
    }
  ];

  const mockNotifications: ActivityNotification[] = [
    {
      id: '1',
      type: 'arrival',
      title: 'Truck Arrived',
      message: 'ABC Transport (ABC-1234) has arrived at Dock 1',
      priority: 'medium',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      is_read: false,
      action_required: false,
      related_booking_id: 'BK001',
      related_dock_id: 'dock-1'
    },
    {
      id: '2',
      type: 'delay',
      title: 'Delay Alert',
      message: 'XYZ Logistics (XYZ-5678) is 30 minutes behind schedule',
      priority: 'high',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      is_read: false,
      action_required: true,
      related_booking_id: 'BK002',
      related_dock_id: 'dock-2'
    }
  ];

  // Hooks
  const { data: kpis = mockKPIs } = useDashboardKPIs(selectedWarehouse, {
    start: filters.date_range.start,
    end: filters.date_range.end
  });

  const { data: bookings = mockBookings } = useLiveBookings(filters);
  const { data: dockStatuses = mockDockStatuses } = useDockStatuses(selectedWarehouse);
  const { data: notifications = mockNotifications } = useNotifications(selectedWarehouse);

  const markAllAsRead = useMarkAllNotificationsAsRead();
  const assignDock = useAssignDock();
  const updateBookingStatus = useUpdateBookingStatus();
  const executeBulkAction = useExecuteBulkAction();

  // Real-time updates
  const { isConnected: isRealTimeConnected } = useRealTimeUpdates({
    warehouseId: selectedWarehouse,
    enabled: isRealTimeEnabled,
    onUpdate: (update) => {
      console.log('Real-time update received:', update);
      // Additional handling can be added here
    }
  });

  // Effects
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      warehouse_id: selectedWarehouse,
      date_range: {
        start: startOfDay(selectedDate).toISOString(),
        end: endOfDay(selectedDate).toISOString(),
      },
    }));
  }, [selectedWarehouse, selectedDate]);

  // Handlers
  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    switch (direction) {
      case 'prev':
        setSelectedDate(prev => subDays(prev, 1));
        break;
      case 'next':
        setSelectedDate(prev => addDays(prev, 1));
        break;
      case 'today':
        setSelectedDate(new Date());
        break;
    }
  };

  const handleBookingClick = (booking: LiveBooking) => {
    setSelectedBooking(booking);
  };

  const handleDockClick = (dock: DockStatus) => {
    console.log('Dock clicked:', dock);
  };

  const handleNotificationClick = (notification: ActivityNotification) => {
    console.log('Notification clicked:', notification);
  };

  const handleQRScan = () => {
    console.log('QR scan initiated');
  };

  const handlePlateSearch = (plateNumber: string) => {
    console.log('Plate search:', plateNumber);
  };

  const handleBookingSelect = (booking: LiveBooking) => {
    setSelectedBooking(booking);
  };

  const handleAssignRamp = async (bookingId: string, dockId: string, rampAssignment?: string) => {
    try {
      await assignDock.mutateAsync({ bookingId, dockId, rampAssignment });
    } catch (error) {
      console.error('Failed to assign ramp:', error);
    }
  };

  const handleUpdatePriority = async (bookingId: string, priority: string) => {
    try {
      await updateBookingStatus.mutateAsync({ bookingId, status: 'priority_updated', notes: `Priority changed to ${priority}` });
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync(selectedWarehouse);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleBulkAction = async (actionId: string, bookingIds: string[], parameters?: Record<string, any>) => {
    try {
      await executeBulkAction.mutateAsync({ actionId, bookingIds, parameters });
      setSelectedBookings([]); // Clear selection after action
    } catch (error) {
      console.error('Failed to execute bulk action:', error);
    }
  };

  const handleSelectionChange = (bookingIds: string[]) => {
    setSelectedBookings(bookingIds);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time warehouse operations management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse-1">Main Warehouse</SelectItem>
              <SelectItem value="warehouse-2">Secondary Warehouse</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            className={cn(
              isRealTimeEnabled && isRealTimeConnected && 'bg-green-50 border-green-200 text-green-700',
              isRealTimeEnabled && !isRealTimeConnected && 'bg-yellow-50 border-yellow-200 text-yellow-700'
            )}
          >
            <div className={cn(
              'w-2 h-2 rounded-full mr-2',
              isRealTimeEnabled && isRealTimeConnected && 'bg-green-500',
              isRealTimeEnabled && !isRealTimeConnected && 'bg-yellow-500',
              !isRealTimeEnabled && 'bg-gray-400'
            )} />
            {isRealTimeEnabled ? 'Live' : 'Offline'}
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('prev')}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('today')}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('next')}
            >
              →
            </Button>
          </div>
          
          <div className="text-lg font-semibold text-dark">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Search className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <KPICard kpi={kpi} />
          </div>
        ))}
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        bookings={bookings}
        selectedBookings={selectedBookings}
        onSelectionChange={handleSelectionChange}
        onBulkAction={handleBulkAction}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Calendar/List View */}
        <div className="xl:col-span-2 space-y-6">
          {viewMode === 'calendar' && (
            <div className="animate-fade-in-up">
              <LiveCalendarGrid
                dockStatuses={dockStatuses}
                timeSlots={[]} // This would come from the API
                selectedDate={selectedDate}
                onBookingClick={handleBookingClick}
                onDockClick={handleDockClick}
              />
            </div>
          )}
          
          {viewMode === 'list' && (
            <Card className="dockflow-card animate-fade-in-up">
              <CardHeader>
                <CardTitle>Bookings List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleBookingClick(booking)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{booking.carrier_name}</div>
                          <div className="text-sm text-gray-600">{booking.trailer_plate}</div>
                        </div>
                        <Badge variant="outline">{booking.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <ActivityFeed
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <GateCheckInWidget
              onQRScan={handleQRScan}
              onPlateSearch={handlePlateSearch}
              onBookingSelect={handleBookingSelect}
            />
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <RampAssignmentPanel
              bookings={bookings}
              dockStatuses={dockStatuses}
              onAssignRamp={handleAssignRamp}
              onUpdatePriority={handleUpdatePriority}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
