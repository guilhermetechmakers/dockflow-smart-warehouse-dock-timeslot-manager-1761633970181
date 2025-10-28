import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDashboardKPIs,
  getLiveBookings,
  getDockStatuses,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getWarehouseYard,
  getCalendarSlots,
  getDashboardStats,
  getBulkActions,
  executeBulkAction,
  assignDock,
  updateBookingStatus,
  processQRCode,
  processPlateEntry,
  getDashboardSettings,
  updateDashboardSettings,
  searchBookings,
  exportDashboardData,
  addBookingNote,
  getConflictSuggestions,
  resolveConflict
} from '@/api/dashboard';
import type {
  DashboardFilters,
  DashboardSettings,
  ActivityNotification
} from '@/types/dashboard';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: (warehouseId: string, dateRange: { start: string; end: string }) =>
    [...dashboardKeys.all, 'kpis', warehouseId, dateRange] as const,
  bookings: (filters: DashboardFilters) =>
    [...dashboardKeys.all, 'bookings', filters] as const,
  dockStatuses: (warehouseId: string) =>
    [...dashboardKeys.all, 'dockStatuses', warehouseId] as const,
  notifications: (warehouseId: string) =>
    [...dashboardKeys.all, 'notifications', warehouseId] as const,
  yard: (warehouseId: string) =>
    [...dashboardKeys.all, 'yard', warehouseId] as const,
  calendarSlots: (filters: DashboardFilters) =>
    [...dashboardKeys.all, 'calendarSlots', filters] as const,
  stats: (warehouseId: string, dateRange: { start: string; end: string }) =>
    [...dashboardKeys.all, 'stats', warehouseId, dateRange] as const,
  bulkActions: () =>
    [...dashboardKeys.all, 'bulkActions'] as const,
  settings: (warehouseId: string) =>
    [...dashboardKeys.all, 'settings', warehouseId] as const,
  search: (warehouseId: string, query: string, filters?: Partial<DashboardFilters>) =>
    [...dashboardKeys.all, 'search', warehouseId, query, filters] as const,
  timeline: (bookingId: string) =>
    [...dashboardKeys.all, 'timeline', bookingId] as const,
  conflicts: (bookingId: string) =>
    [...dashboardKeys.all, 'conflicts', bookingId] as const,
};

// Dashboard KPIs
export const useDashboardKPIs = (warehouseId: string, dateRange: { start: string; end: string }) => {
  return useQuery({
    queryKey: dashboardKeys.kpis(warehouseId, dateRange),
    queryFn: () => getDashboardKPIs(warehouseId, dateRange),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!warehouseId,
  });
};

// Live bookings
export const useLiveBookings = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: dashboardKeys.bookings(filters),
    queryFn: () => getLiveBookings(filters),
    refetchInterval: 10000, // Refetch every 10 seconds
    enabled: !!filters.warehouse_id,
  });
};

// Dock statuses
export const useDockStatuses = (warehouseId: string) => {
  return useQuery({
    queryKey: dashboardKeys.dockStatuses(warehouseId),
    queryFn: () => getDockStatuses(warehouseId),
    refetchInterval: 15000, // Refetch every 15 seconds
    enabled: !!warehouseId,
  });
};

// Notifications
export const useNotifications = (warehouseId: string, limit = 50) => {
  return useQuery({
    queryKey: dashboardKeys.notifications(warehouseId),
    queryFn: () => getNotifications(warehouseId, limit),
    refetchInterval: 5000, // Refetch every 5 seconds
    enabled: !!warehouseId,
  });
};

// Mark notification as read mutation
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Update the notification in the cache
      queryClient.setQueryData(
        dashboardKeys.notifications(''), // This will need to be updated with actual warehouse ID
        (old: ActivityNotification[] | undefined) => {
          if (!old) return old;
          return old.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          );
        }
      );
      toast.success('Notification marked as read');
    },
    onError: (error) => {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    },
  });
};

// Mark all notifications as read mutation
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: (_, warehouseId) => {
      // Update all notifications in the cache
      queryClient.setQueryData(
        dashboardKeys.notifications(warehouseId),
        (old: ActivityNotification[] | undefined) => {
          if (!old) return old;
          return old.map(notification => ({ ...notification, is_read: true }));
        }
      );
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', error);
    },
  });
};

// Warehouse yard
export const useWarehouseYard = (warehouseId: string) => {
  return useQuery({
    queryKey: dashboardKeys.yard(warehouseId),
    queryFn: () => getWarehouseYard(warehouseId),
    enabled: !!warehouseId,
  });
};

// Calendar slots
export const useCalendarSlots = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: dashboardKeys.calendarSlots(filters),
    queryFn: () => getCalendarSlots(filters),
    refetchInterval: 20000, // Refetch every 20 seconds
    enabled: !!filters.warehouse_id,
  });
};

// Dashboard stats
export const useDashboardStats = (warehouseId: string, dateRange: { start: string; end: string }) => {
  return useQuery({
    queryKey: dashboardKeys.stats(warehouseId, dateRange),
    queryFn: () => getDashboardStats(warehouseId, dateRange),
    refetchInterval: 60000, // Refetch every minute
    enabled: !!warehouseId,
  });
};

// Bulk actions
export const useBulkActions = () => {
  return useQuery({
    queryKey: dashboardKeys.bulkActions(),
    queryFn: getBulkActions,
  });
};

// Execute bulk action mutation
export const useExecuteBulkAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ actionId, bookingIds, parameters }: {
      actionId: string;
      bookingIds: string[];
      parameters?: Record<string, any>;
    }) => executeBulkAction(actionId, bookingIds, parameters),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Bulk action completed successfully');
    },
    onError: (error) => {
      toast.error('Failed to execute bulk action');
      console.error('Error executing bulk action:', error);
    },
  });
};

// Assign dock mutation
export const useAssignDock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, dockId, rampAssignment }: {
      bookingId: string;
      dockId: string;
      rampAssignment?: string;
    }) => assignDock(bookingId, dockId, rampAssignment),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Dock assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign dock');
      console.error('Error assigning dock:', error);
    },
  });
};

// Update booking status mutation
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, status, notes }: {
      bookingId: string;
      status: string;
      notes?: string;
    }) => updateBookingStatus(bookingId, status, notes),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Booking status updated');
    },
    onError: (error) => {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
    },
  });
};

// Process QR code mutation
export const useProcessQRCode = () => {
  return useMutation({
    mutationFn: processQRCode,
    onSuccess: (booking) => {
      toast.success(`Booking found: ${booking.carrier_name} - ${booking.trailer_plate}`);
    },
    onError: (error) => {
      toast.error('Invalid QR code or booking not found');
      console.error('Error processing QR code:', error);
    },
  });
};

// Process plate entry mutation
export const useProcessPlateEntry = () => {
  return useMutation({
    mutationFn: processPlateEntry,
    onSuccess: (booking) => {
      toast.success(`Booking found: ${booking.carrier_name} - ${booking.trailer_plate}`);
    },
    onError: (error) => {
      toast.error('No booking found for this plate number');
      console.error('Error processing plate entry:', error);
    },
  });
};

// Dashboard settings
export const useDashboardSettings = (warehouseId: string) => {
  return useQuery({
    queryKey: dashboardKeys.settings(warehouseId),
    queryFn: () => getDashboardSettings(warehouseId),
    enabled: !!warehouseId,
  });
};

// Update dashboard settings mutation
export const useUpdateDashboardSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ warehouseId, settings }: {
      warehouseId: string;
      settings: Partial<DashboardSettings>;
    }) => updateDashboardSettings(warehouseId, settings),
    onSuccess: (_, { warehouseId }) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.settings(warehouseId) });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Error updating settings:', error);
    },
  });
};

// Search bookings
export const useSearchBookings = (
  warehouseId: string,
  query: string,
  filters?: Partial<DashboardFilters>
) => {
  return useQuery({
    queryKey: dashboardKeys.search(warehouseId, query, filters),
    queryFn: () => searchBookings(warehouseId, query, filters),
    enabled: !!warehouseId && query.length > 2,
  });
};

// Export dashboard data mutation
export const useExportDashboardData = () => {
  return useMutation({
    mutationFn: ({ warehouseId, format, filters }: {
      warehouseId: string;
      format: 'csv' | 'excel' | 'pdf';
      filters: DashboardFilters;
    }) => exportDashboardData(warehouseId, format, filters),
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export completed successfully');
    },
    onError: (error) => {
      toast.error('Failed to export data');
      console.error('Error exporting data:', error);
    },
  });
};

// Add booking note mutation
export const useAddBookingNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, note }: { bookingId: string; note: string }) =>
      addBookingNote(bookingId, note),
    onSuccess: (_, { bookingId }) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.timeline(bookingId) });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add note');
      console.error('Error adding note:', error);
    },
  });
};

// Get conflict suggestions
export const useConflictSuggestions = (bookingId: string) => {
  return useQuery({
    queryKey: dashboardKeys.conflicts(bookingId),
    queryFn: () => getConflictSuggestions(bookingId),
    enabled: !!bookingId,
  });
};

// Resolve conflict mutation
export const useResolveConflict = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conflictId, resolution }: {
      conflictId: string;
      resolution: 'reschedule' | 'reassign' | 'override';
    }) => resolveConflict(conflictId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success('Conflict resolved successfully');
    },
    onError: (error) => {
      toast.error('Failed to resolve conflict');
      console.error('Error resolving conflict:', error);
    },
  });
};