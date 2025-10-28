import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { analyticsApi } from '@/api/analytics';
import type {
  CustomReportBuilder,
  ExportSettings,
  ReportFilters,
} from '@/types/analytics';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: () => [...analyticsKeys.all, 'overview'] as const,
  kpis: (filters?: ReportFilters) => [...analyticsKeys.all, 'kpis', filters] as const,
  reports: (page?: number, limit?: number, search?: string) => 
    [...analyticsKeys.all, 'reports', { page, limit, search }] as const,
  report: (id: string) => [...analyticsKeys.all, 'report', id] as const,
  reportData: (id: string, filters?: ReportFilters) => 
    [...analyticsKeys.all, 'reportData', id, filters] as const,
  prebuiltReports: () => [...analyticsKeys.all, 'prebuiltReports'] as const,
  templates: () => [...analyticsKeys.all, 'templates'] as const,
  exportHistory: (page?: number, limit?: number) => 
    [...analyticsKeys.all, 'exportHistory', { page, limit }] as const,
  exportSettings: (reportId: string) => 
    [...analyticsKeys.all, 'exportSettings', reportId] as const,
  reportAccess: (reportId: string) => 
    [...analyticsKeys.all, 'reportAccess', reportId] as const,
  generationJobs: (page?: number, limit?: number) => 
    [...analyticsKeys.all, 'generationJobs', { page, limit }] as const,
  generationJob: (jobId: string) => 
    [...analyticsKeys.all, 'generationJob', jobId] as const,
  favorites: () => [...analyticsKeys.all, 'favorites'] as const,
  warehouses: () => [...analyticsKeys.all, 'warehouses'] as const,
  docks: (warehouseId?: string) => [...analyticsKeys.all, 'docks', warehouseId] as const,
  carriers: () => [...analyticsKeys.all, 'carriers'] as const,
  cargoTypes: () => [...analyticsKeys.all, 'cargoTypes'] as const,
};

// Analytics Overview
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: analyticsApi.getOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// KPIs
export function useKPIs(filters?: ReportFilters) {
  return useQuery({
    queryKey: analyticsKeys.kpis(filters),
    queryFn: () => analyticsApi.getKPIs(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Reports
export function useReports(page = 1, limit = 20, search?: string) {
  return useQuery({
    queryKey: analyticsKeys.reports(page, limit, search),
    queryFn: () => analyticsApi.getReports(page, limit, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: analyticsKeys.report(id),
    queryFn: () => analyticsApi.getReport(id),
    enabled: !!id,
  });
}

export function useReportData(id: string, filters?: ReportFilters) {
  return useQuery({
    queryKey: analyticsKeys.reportData(id, filters),
    queryFn: () => analyticsApi.generateReportData(id, filters),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Prebuilt Reports
export function usePrebuiltReports() {
  return useQuery({
    queryKey: analyticsKeys.prebuiltReports(),
    queryFn: analyticsApi.getPrebuiltReports,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useReportTemplates() {
  return useQuery({
    queryKey: analyticsKeys.templates(),
    queryFn: analyticsApi.getReportTemplates,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Export History
export function useExportHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: analyticsKeys.exportHistory(page, limit),
    queryFn: () => analyticsApi.getExportHistory(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Export Settings
export function useExportSettings(reportId: string) {
  return useQuery({
    queryKey: analyticsKeys.exportSettings(reportId),
    queryFn: () => analyticsApi.getExportSettings(reportId),
    enabled: !!reportId,
  });
}

// Report Access
export function useReportAccess(reportId: string) {
  return useQuery({
    queryKey: analyticsKeys.reportAccess(reportId),
    queryFn: () => analyticsApi.getReportAccess(reportId),
    enabled: !!reportId,
  });
}

// Generation Jobs
export function useGenerationJobs(page = 1, limit = 20) {
  return useQuery({
    queryKey: analyticsKeys.generationJobs(page, limit),
    queryFn: () => analyticsApi.getGenerationJobs(page, limit),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
}

export function useGenerationJob(jobId: string) {
  return useQuery({
    queryKey: analyticsKeys.generationJob(jobId),
    queryFn: () => analyticsApi.getGenerationJob(jobId),
    enabled: !!jobId,
    refetchInterval: 1000 * 5, // Refetch every 5 seconds
  });
}

// Favorites
export function useFavoriteReports() {
  return useQuery({
    queryKey: analyticsKeys.favorites(),
    queryFn: analyticsApi.getFavoriteReports,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Filter Data
export function useWarehouses() {
  return useQuery({
    queryKey: analyticsKeys.warehouses(),
    queryFn: analyticsApi.getWarehouses,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useDocks(warehouseId?: string) {
  return useQuery({
    queryKey: analyticsKeys.docks(warehouseId),
    queryFn: () => analyticsApi.getDocks(warehouseId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCarriers() {
  return useQuery({
    queryKey: analyticsKeys.carriers(),
    queryFn: analyticsApi.getCarriers,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCargoTypes() {
  return useQuery({
    queryKey: analyticsKeys.cargoTypes(),
    queryFn: analyticsApi.getCargoTypes,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Mutations
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (report: CustomReportBuilder) => analyticsApi.createReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.overview() });
      toast.success('Report created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create report: ${error.message}`);
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CustomReportBuilder> }) =>
      analyticsApi.updateReport(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.report(id) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      toast.success('Report updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.overview() });
      toast.success('Report deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });
}

export function useDuplicateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      analyticsApi.duplicateReport(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.overview() });
      toast.success('Report duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate report: ${error.message}`);
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ 
      id, 
      format, 
      filters 
    }: { 
      id: string; 
      format: 'csv' | 'pdf' | 'excel'; 
      filters?: ReportFilters 
    }) => analyticsApi.exportReport(id, format, filters),
    onSuccess: (data) => {
      // Open download URL
      window.open(data.download_url, '_blank');
      toast.success('Report exported successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export report: ${error.message}`);
    },
  });
}

export function useCreateExportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reportId, 
      settings 
    }: { 
      reportId: string; 
      settings: Omit<ExportSettings, 'id' | 'report_id' | 'created_at' | 'updated_at'> 
    }) => analyticsApi.createExportSettings(reportId, settings),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.exportSettings(reportId) });
      toast.success('Export schedule created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create export schedule: ${error.message}`);
    },
  });
}

export function useUpdateExportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reportId, 
      settingsId, 
      updates 
    }: { 
      reportId: string; 
      settingsId: string; 
      updates: Partial<ExportSettings> 
    }) => analyticsApi.updateExportSettings(reportId, settingsId, updates),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.exportSettings(reportId) });
      toast.success('Export schedule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update export schedule: ${error.message}`);
    },
  });
}

export function useDeleteExportSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, settingsId }: { reportId: string; settingsId: string }) =>
      analyticsApi.deleteExportSettings(reportId, settingsId),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.exportSettings(reportId) });
      toast.success('Export schedule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete export schedule: ${error.message}`);
    },
  });
}

export function useGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reportId, 
      userId, 
      permissionLevel 
    }: { 
      reportId: string; 
      userId: string; 
      permissionLevel: 'view' | 'edit' | 'admin' 
    }) => analyticsApi.grantAccess(reportId, userId, permissionLevel),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reportAccess(reportId) });
      toast.success('Access granted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to grant access: ${error.message}`);
    },
  });
}

export function useUpdateAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      reportId, 
      accessId, 
      permissionLevel 
    }: { 
      reportId: string; 
      accessId: string; 
      permissionLevel: 'view' | 'edit' | 'admin' 
    }) => analyticsApi.updateAccess(reportId, accessId, permissionLevel),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reportAccess(reportId) });
      toast.success('Access updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update access: ${error.message}`);
    },
  });
}

export function useRevokeAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, accessId }: { reportId: string; accessId: string }) =>
      analyticsApi.revokeAccess(reportId, accessId),
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reportAccess(reportId) });
      toast.success('Access revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to revoke access: ${error.message}`);
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => analyticsApi.toggleFavorite(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.report(reportId) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.reports() });
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle favorite: ${error.message}`);
    },
  });
}

export function useCancelGenerationJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => analyticsApi.cancelGenerationJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.generationJobs() });
      toast.success('Generation job cancelled');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel job: ${error.message}`);
    },
  });
}