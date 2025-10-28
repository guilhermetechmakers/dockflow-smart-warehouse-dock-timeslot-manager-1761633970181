import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Settings, 
  AlertTriangle,
  Plus,
  BarChart3,
  Clock
} from 'lucide-react';

// Schedule Components
import { CalendarView } from '@/components/schedule/CalendarView';
import { ScheduleFilters } from '@/components/schedule/ScheduleFilters';
import { SlotCreationModal } from '@/components/schedule/SlotCreationModal';
import { ConflictResolutionAssistant } from '@/components/schedule/ConflictResolutionAssistant';
import { ScheduleExport } from '@/components/schedule/ScheduleExport';
import { DragDropProvider } from '@/components/schedule/DragDropProvider';
import { ScheduleSkeleton } from '@/components/schedule/ScheduleSkeleton';

// Hooks
import { 
  useScheduleSlots, 
  useScheduleBookings, 
  useScheduleConflicts, 
  useScheduleStats,
  useDocks,
  useCarriers,
  useCargoTypes,
  useCreateSlotRule,
  useRescheduleBooking,
  useExportSchedule
} from '@/hooks/useSchedule';

// Types
import type { 
  ScheduleViewMode, 
  ScheduleFilter, 
  CreateSlotRuleInput,
  ScheduleBooking,
  ScheduleSlot
} from '@/types/schedule';

export function SchedulePage() {
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ScheduleViewMode['type']>('week');
  const [filters, setFilters] = useState<ScheduleFilter>({});
  const [activeTab, setActiveTab] = useState('calendar');
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Mock warehouse ID - in real app, this would come from context or props
  const warehouseId = 'warehouse-1';

  // API Hooks
  const { data: docks = [], isLoading: docksLoading } = useDocks(warehouseId);
  const { data: carriers = [], isLoading: carriersLoading } = useCarriers(warehouseId);
  const { data: cargoTypes = [], isLoading: cargoTypesLoading } = useCargoTypes(warehouseId);
  
  const { data: slots = [], isLoading: slotsLoading } = useScheduleSlots(
    warehouseId,
    { type: viewMode, date: format(currentDate, 'yyyy-MM-dd') },
    filters
  );
  
  const { data: bookings = [], isLoading: bookingsLoading } = useScheduleBookings(
    warehouseId,
    { type: viewMode, date: format(currentDate, 'yyyy-MM-dd') },
    filters
  );
  
  const { data: conflicts = [], isLoading: conflictsLoading } = useScheduleConflicts(
    warehouseId,
    filters.date_range
  );
  
  const { data: stats } = useScheduleStats(
    warehouseId,
    filters.date_range
  );

  // Mutations
  const createSlotRule = useCreateSlotRule();
  const rescheduleBooking = useRescheduleBooking();
  const exportSchedule = useExportSchedule();

  // Handlers
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewModeChange = (mode: ScheduleViewMode['type']) => {
    setViewMode(mode);
  };

  const handleFiltersChange = (newFilters: ScheduleFilter) => {
    setFilters(newFilters);
  };

  const handleBookingClick = (booking: ScheduleBooking) => {
    // In a real app, this would open a booking detail modal or navigate to booking page
    console.log('Booking clicked:', booking);
  };

  const handleSlotClick = (slot: ScheduleSlot) => {
    // In a real app, this would open slot details or allow editing
    console.log('Slot clicked:', slot);
  };

  const handleCreateSlotRule = (data: CreateSlotRuleInput) => {
    createSlotRule.mutate(data, {
      onSuccess: () => {
        setIsSlotModalOpen(false);
      },
    });
  };

  const handleResolveConflict = (conflictId: string, resolutionId: string) => {
    // In a real app, this would call the conflict resolution API
    console.log('Resolving conflict:', conflictId, 'with resolution:', resolutionId);
  };

  const handleDismissConflict = (conflictId: string) => {
    // In a real app, this would call the API to dismiss the conflict
    console.log('Dismissing conflict:', conflictId);
  };

  const handleViewBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      console.log('View booking:', booking);
    }
  };

  const handleBookingReschedule = (bookingId: string, _newSlotId: string) => {
    rescheduleBooking.mutate({
      booking_id: bookingId,
      new_dock_id: undefined,
      new_start_time: new Date().toISOString(),
      new_end_time: new Date().toISOString(),
      reason: 'Drag and drop reschedule',
      notify_carrier: true,
    });
  };

  const handleExport = (options: any) => {
    exportSchedule.mutate(options);
  };

  const isLoading = slotsLoading || bookingsLoading || docksLoading || carriersLoading || cargoTypesLoading;

  if (isLoading) {
    return <ScheduleSkeleton />;
  }

  return (
    <DragDropProvider onBookingReschedule={handleBookingReschedule}>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark">Schedule Management</h1>
            <p className="text-gray-600 mt-1">
              Manage dock schedules, resolve conflicts, and optimize warehouse operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ScheduleExport onExport={handleExport} isLoading={exportSchedule.isPending} />
            <Button
              onClick={() => setIsSlotModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Slot Rule
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
            <Card className="dockflow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-dark">{stats.total_bookings}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-coral-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dockflow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Utilization</p>
                    <p className="text-2xl font-bold text-dark">{stats.utilization_percentage}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-coral-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dockflow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">On-Time Rate</p>
                    <p className="text-2xl font-bold text-dark">{stats.on_time_percentage}%</p>
                  </div>
                  <Clock className="h-8 w-8 text-coral-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dockflow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conflicts</p>
                    <p className="text-2xl font-bold text-dark">{stats.conflict_count}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-coral-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Conflicts
              {conflicts.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {conflicts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6 animate-fade-in">
            {/* Filters */}
            <div className="animate-fade-in-down">
              <ScheduleFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                docks={docks}
                carriers={carriers}
                cargoTypes={cargoTypes}
                isLoading={isLoading}
              />
            </div>

            {/* Calendar View */}
            <Card className="dockflow-card animate-fade-in-up">
              <CardContent className="p-6">
                <CalendarView
                  viewMode={viewMode}
                  currentDate={currentDate}
                  slots={slots}
                  docks={docks}
                  onDateChange={handleDateChange}
                  onViewModeChange={handleViewModeChange}
                  onBookingClick={handleBookingClick}
                  onSlotClick={handleSlotClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-6 animate-fade-in">
            <ConflictResolutionAssistant
              conflicts={conflicts}
              onResolveConflict={handleResolveConflict}
              onDismissConflict={handleDismissConflict}
              onViewBooking={handleViewBooking}
              isLoading={conflictsLoading}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle>Schedule Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Schedule settings and configuration options will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Slot Creation Modal */}
        <SlotCreationModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          onSubmit={handleCreateSlotRule}
          docks={docks}
          isLoading={createSlotRule.isPending}
        />
      </div>
    </DragDropProvider>
  );
}
