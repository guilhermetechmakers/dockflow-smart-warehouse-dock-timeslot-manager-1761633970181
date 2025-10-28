import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  dockApi,
  carrierApi,
  cargoTypeApi,
  slotRuleApi,
  scheduleApi,
} from '@/api/schedule';
import type {
  ScheduleViewMode,
  ScheduleFilter,
  UpdateSlotRuleInput,
} from '@/types/schedule';

// Query keys
export const scheduleKeys = {
  all: ['schedule'] as const,
  docks: () => [...scheduleKeys.all, 'docks'] as const,
  carriers: () => [...scheduleKeys.all, 'carriers'] as const,
  cargoTypes: () => [...scheduleKeys.all, 'cargo-types'] as const,
  slotRules: () => [...scheduleKeys.all, 'slot-rules'] as const,
  slots: (warehouseId: string, viewMode: ScheduleViewMode, filters?: ScheduleFilter) =>
    [...scheduleKeys.all, 'slots', warehouseId, viewMode, filters] as const,
  bookings: (warehouseId: string, viewMode: ScheduleViewMode, filters?: ScheduleFilter) =>
    [...scheduleKeys.all, 'bookings', warehouseId, viewMode, filters] as const,
  conflicts: (warehouseId: string, dateRange?: { start: string; end: string }) =>
    [...scheduleKeys.all, 'conflicts', warehouseId, dateRange] as const,
  stats: (warehouseId: string, dateRange?: { start: string; end: string }) =>
    [...scheduleKeys.all, 'stats', warehouseId, dateRange] as const,
};

// Dock hooks
export const useDocks = (warehouseId?: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.docks(), warehouseId],
    queryFn: () => dockApi.getAll(warehouseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDock = (id: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.docks(), id],
    queryFn: () => dockApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateDock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dockApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.docks() });
      toast.success('Dock created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create dock: ${error.message}`);
    },
  });
};

export const useUpdateDock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => dockApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.docks() });
      toast.success('Dock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dock: ${error.message}`);
    },
  });
};

export const useDeleteDock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: dockApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.docks() });
      toast.success('Dock deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete dock: ${error.message}`);
    },
  });
};

// Carrier hooks
export const useCarriers = (warehouseId?: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.carriers(), warehouseId],
    queryFn: () => carrierApi.getAll(warehouseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCarrier = (id: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.carriers(), id],
    queryFn: () => carrierApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: carrierApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.carriers() });
      toast.success('Carrier created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create carrier: ${error.message}`);
    },
  });
};

export const useUpdateCarrier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => carrierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.carriers() });
      toast.success('Carrier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update carrier: ${error.message}`);
    },
  });
};

export const useDeleteCarrier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: carrierApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.carriers() });
      toast.success('Carrier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete carrier: ${error.message}`);
    },
  });
};

// Cargo Type hooks
export const useCargoTypes = (warehouseId?: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.cargoTypes(), warehouseId],
    queryFn: () => cargoTypeApi.getAll(warehouseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCargoType = (id: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.cargoTypes(), id],
    queryFn: () => cargoTypeApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCargoType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cargoTypeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.cargoTypes() });
      toast.success('Cargo type created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create cargo type: ${error.message}`);
    },
  });
};

export const useUpdateCargoType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cargoTypeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.cargoTypes() });
      toast.success('Cargo type updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update cargo type: ${error.message}`);
    },
  });
};

export const useDeleteCargoType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cargoTypeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.cargoTypes() });
      toast.success('Cargo type deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete cargo type: ${error.message}`);
    },
  });
};

// Slot Rule hooks
export const useSlotRules = (warehouseId?: string, dockId?: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.slotRules(), warehouseId, dockId],
    queryFn: () => slotRuleApi.getAll(warehouseId, dockId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSlotRule = (id: string) => {
  return useQuery({
    queryKey: [...scheduleKeys.slotRules(), id],
    queryFn: () => slotRuleApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSlotRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: slotRuleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.slotRules() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Slot rule created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create slot rule: ${error.message}`);
    },
  });
};

export const useUpdateSlotRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlotRuleInput }) => 
      slotRuleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.slotRules() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Slot rule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update slot rule: ${error.message}`);
    },
  });
};

export const useDeleteSlotRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: slotRuleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.slotRules() });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Slot rule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete slot rule: ${error.message}`);
    },
  });
};

export const useGenerateSlots = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ruleId, startDate, endDate }: { 
      ruleId: string; 
      startDate: string; 
      endDate: string; 
    }) => slotRuleApi.generateSlots(ruleId, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success('Slots generated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate slots: ${error.message}`);
    },
  });
};

// Schedule hooks
export const useScheduleSlots = (
  warehouseId: string,
  viewMode: ScheduleViewMode,
  filters?: ScheduleFilter
) => {
  return useQuery({
    queryKey: scheduleKeys.slots(warehouseId, viewMode, filters),
    queryFn: () => scheduleApi.getSlots(warehouseId, viewMode, filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useScheduleBookings = (
  warehouseId: string,
  viewMode: ScheduleViewMode,
  filters?: ScheduleFilter
) => {
  return useQuery({
    queryKey: scheduleKeys.bookings(warehouseId, viewMode, filters),
    queryFn: () => scheduleApi.getBookings(warehouseId, viewMode, filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useScheduleConflicts = (
  warehouseId: string,
  dateRange?: { start: string; end: string }
) => {
  return useQuery({
    queryKey: scheduleKeys.conflicts(warehouseId, dateRange),
    queryFn: () => scheduleApi.getConflicts(warehouseId, dateRange),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useScheduleStats = (
  warehouseId: string,
  dateRange?: { start: string; end: string }
) => {
  return useQuery({
    queryKey: scheduleKeys.stats(warehouseId, dateRange),
    queryFn: () => scheduleApi.getStats(warehouseId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scheduleApi.rescheduleBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      if (data.conflicts?.length) {
        toast.warning(`Booking rescheduled with ${data.conflicts.length} conflicts`);
      } else {
        toast.success('Booking rescheduled successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to reschedule booking: ${error.message}`);
    },
  });
};

export const useAssignBookingToSlot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bookingId, slotId }: { bookingId: string; slotId: string }) =>
      scheduleApi.assignBookingToSlot(bookingId, slotId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      if (data.conflicts?.length) {
        toast.warning(`Booking assigned with ${data.conflicts.length} conflicts`);
      } else {
        toast.success('Booking assigned successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign booking: ${error.message}`);
    },
  });
};

export const useExportSchedule = () => {
  return useMutation({
    mutationFn: scheduleApi.exportSchedule,
    onSuccess: (data) => {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = `schedule-export-${new Date().toISOString().split('T')[0]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Schedule exported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export schedule: ${error.message}`);
    },
  });
};