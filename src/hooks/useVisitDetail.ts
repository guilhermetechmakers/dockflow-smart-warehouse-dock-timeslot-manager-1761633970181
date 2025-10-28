import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { visitDetailApi } from '@/api/visit-detail';
import type {
  CreateDisputeInput,
  UpdateDisputeInput,
  CreateVisitNoteInput,
  VisitDetailFilters,
} from '@/types/visit-detail';

// Query keys
export const visitDetailKeys = {
  all: ['visit-detail'] as const,
  detail: (visitId: string, filters?: VisitDetailFilters) => 
    [...visitDetailKeys.all, 'detail', visitId, filters] as const,
  stats: (visitId: string) => 
    [...visitDetailKeys.all, 'stats', visitId] as const,
  causeCodes: (warehouseId?: string) => 
    [...visitDetailKeys.all, 'cause-codes', warehouseId] as const,
  timeline: (visitId: string) => 
    [...visitDetailKeys.all, 'timeline', visitId] as const,
  files: (visitId: string) => 
    [...visitDetailKeys.all, 'files', visitId] as const,
  notes: (visitId: string) => 
    [...visitDetailKeys.all, 'notes', visitId] as const,
  disputes: (visitId: string) => 
    [...visitDetailKeys.all, 'disputes', visitId] as const,
  delayAnalysis: (visitId: string) => 
    [...visitDetailKeys.all, 'delay-analysis', visitId] as const,
  summary: (visitId: string) => 
    [...visitDetailKeys.all, 'summary', visitId] as const,
};

// Visit Detail hooks
export const useVisitDetail = (visitId: string, filters?: VisitDetailFilters) => {
  return useQuery({
    queryKey: visitDetailKeys.detail(visitId, filters),
    queryFn: () => visitDetailApi.getVisitDetail(visitId, filters),
    enabled: !!visitId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useVisitStats = (visitId: string) => {
  return useQuery({
    queryKey: visitDetailKeys.stats(visitId),
    queryFn: () => visitDetailApi.getVisitStats(visitId),
    enabled: !!visitId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCauseCodes = (warehouseId?: string) => {
  return useQuery({
    queryKey: visitDetailKeys.causeCodes(warehouseId),
    queryFn: () => visitDetailApi.getCauseCodes(warehouseId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useVisitTimeline = (visitId: string) => {
  return useQuery({
    queryKey: visitDetailKeys.timeline(visitId),
    queryFn: () => visitDetailApi.getVisitTimeline(visitId),
    enabled: !!visitId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useVisitDelayAnalysis = (visitId: string) => {
  return useQuery({
    queryKey: visitDetailKeys.delayAnalysis(visitId),
    queryFn: () => visitDetailApi.getDelayAnalysis(visitId),
    enabled: !!visitId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVisitSummary = (visitId: string) => {
  return useQuery({
    queryKey: visitDetailKeys.summary(visitId),
    queryFn: () => visitDetailApi.getVisitSummary(visitId),
    enabled: !!visitId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Status and assignment mutations
export const useUpdateVisitStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ visitId, status, notes }: { 
      visitId: string; 
      status: string; 
      notes?: string; 
    }) => visitDetailApi.updateVisitStatus(visitId, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.timeline(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.summary(variables.visitId) 
      });
      toast.success('Visit status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update visit status: ${error.message}`);
    },
  });
};

export const useAssignRamp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ visitId, ramp }: { visitId: string; ramp: string }) =>
      visitDetailApi.assignRamp(visitId, ramp),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.timeline(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.summary(variables.visitId) 
      });
      toast.success('Ramp assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign ramp: ${error.message}`);
    },
  });
};

// Notes mutations
export const useAddVisitNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ visitId, note }: { visitId: string; note: CreateVisitNoteInput }) =>
      visitDetailApi.addNote(visitId, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.notes(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Note added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

export const useUpdateVisitNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      visitId, 
      noteId, 
      note 
    }: { 
      visitId: string; 
      noteId: string; 
      note: Partial<CreateVisitNoteInput>; 
    }) => visitDetailApi.updateNote(visitId, noteId, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.notes(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Note updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
};

export const useDeleteVisitNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ visitId, noteId }: { visitId: string; noteId: string }) =>
      visitDetailApi.deleteNote(visitId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.notes(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Note deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });
};

// File mutations
export const useUploadVisitFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      visitId, 
      file, 
      metadata 
    }: { 
      visitId: string; 
      file: File; 
      metadata?: { description?: string; tags?: string[] }; 
    }) => visitDetailApi.uploadFile(visitId, file, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.files(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload file: ${error.message}`);
    },
  });
};

export const useDeleteVisitFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ visitId, fileId }: { visitId: string; fileId: string }) =>
      visitDetailApi.deleteFile(visitId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.files(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('File deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete file: ${error.message}`);
    },
  });
};

// Dispute mutations
export const useCreateDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ visitId, dispute }: { visitId: string; dispute: CreateDisputeInput }) =>
      visitDetailApi.createDispute(visitId, dispute),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.disputes(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Dispute created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create dispute: ${error.message}`);
    },
  });
};

export const useUpdateDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      visitId, 
      disputeId, 
      dispute 
    }: { 
      visitId: string; 
      disputeId: string; 
      dispute: UpdateDisputeInput; 
    }) => visitDetailApi.updateDispute(visitId, disputeId, dispute),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.disputes(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Dispute updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dispute: ${error.message}`);
    },
  });
};

// Export mutation
export const useExportVisit = () => {
  return useMutation({
    mutationFn: ({ 
      visitId, 
      format, 
      options 
    }: { 
      visitId: string; 
      format: 'pdf' | 'csv' | 'excel'; 
      options?: {
        include_files?: boolean;
        include_notes?: boolean;
        include_timeline?: boolean;
        include_disputes?: boolean;
      };
    }) => visitDetailApi.exportVisit(visitId, format, options),
    onSuccess: (data) => {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = `visit-${data.visit_id}-export-${new Date().toISOString().split('T')[0]}.${data.export_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Visit exported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export visit: ${error.message}`);
    },
  });
};

// Timeline mutations
export const useAddTimelineEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      visitId, 
      event 
    }: { 
      visitId: string; 
      event: {
        event_type: 'booked' | 'arrived' | 'assigned' | 'started' | 'completed' | 'cancelled';
        notes?: string;
        metadata?: Record<string, any>;
      };
    }) => visitDetailApi.addTimelineEvent(visitId, event),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.timeline(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Timeline event added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add timeline event: ${error.message}`);
    },
  });
};

// Delay analysis mutation
export const useUpdateDelayAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      visitId, 
      analysis 
    }: { 
      visitId: string; 
      analysis: {
        suggested_cause_codes?: string[];
        delay_breakdown?: Array<{
          phase: 'arrival' | 'assignment' | 'unloading' | 'completion';
          cause?: string;
        }>;
      };
    }) => visitDetailApi.updateDelayAnalysis(visitId, analysis),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.delayAnalysis(variables.visitId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: visitDetailKeys.detail(variables.visitId) 
      });
      toast.success('Delay analysis updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update delay analysis: ${error.message}`);
    },
  });
};