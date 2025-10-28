import { api } from '@/lib/api';
import type {
  Report,
  ReportData,
  CustomReportBuilder,
  ExportSettings,
  UserAccess,
  PrebuiltReport,
  ReportTemplate,
  AnalyticsOverview,
  ReportFilters,
  SavedReport,
  ReportGenerationJob,
  AnalyticsKPI,
} from '@/types/analytics';

// Analytics API
export const analyticsApi = {
  // Get analytics overview
  getOverview: async (): Promise<AnalyticsOverview> => {
    return api.get<AnalyticsOverview>('/analytics/overview');
  },

  // Get KPIs
  getKPIs: async (filters?: ReportFilters): Promise<AnalyticsKPI[]> => {
    const params = filters ? `?${new URLSearchParams(JSON.stringify(filters))}` : '';
    return api.get<AnalyticsKPI[]>(`/analytics/kpis${params}`);
  },

  // Reports CRUD
  getReports: async (page = 1, limit = 20, search?: string): Promise<{
    reports: SavedReport[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return api.get<{
      reports: SavedReport[];
      total: number;
      page: number;
      limit: number;
    }>(`/analytics/reports?${params}`);
  },

  getReport: async (id: string): Promise<Report> => {
    return api.get<Report>(`/analytics/reports/${id}`);
  },

  createReport: async (report: CustomReportBuilder): Promise<Report> => {
    return api.post<Report>('/analytics/reports', report);
  },

  updateReport: async (id: string, updates: Partial<CustomReportBuilder>): Promise<Report> => {
    return api.put<Report>(`/analytics/reports/${id}`, updates);
  },

  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/analytics/reports/${id}`);
  },

  duplicateReport: async (id: string, name: string): Promise<Report> => {
    return api.post<Report>(`/analytics/reports/${id}/duplicate`, { name });
  },

  // Report data generation
  generateReportData: async (id: string, filters?: ReportFilters): Promise<ReportData> => {
    const params = filters ? `?${new URLSearchParams(JSON.stringify(filters))}` : '';
    return api.get<ReportData>(`/analytics/reports/${id}/data${params}`);
  },

  // Prebuilt reports
  getPrebuiltReports: async (): Promise<PrebuiltReport[]> => {
    return api.get<PrebuiltReport[]>('/analytics/reports/prebuilt');
  },

  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    return api.get<ReportTemplate[]>('/analytics/reports/templates');
  },

  // Export functionality
  exportReport: async (
    id: string,
    format: 'csv' | 'pdf' | 'excel',
    filters?: ReportFilters
  ): Promise<{ download_url: string; expires_at: string }> => {
    return api.post(`/analytics/reports/${id}/export`, {
      format,
      filters,
    });
  },

  getExportHistory: async (page = 1, limit = 20): Promise<{
    exports: Array<{
      id: string;
      report_name: string;
      format: string;
      created_at: string;
      download_url: string;
      expires_at: string;
    }>;
    total: number;
  }> => {
    return api.get<{
      exports: Array<{
        id: string;
        report_name: string;
        format: string;
        created_at: string;
        download_url: string;
        expires_at: string;
      }>;
      total: number;
    }>(`/analytics/exports?page=${page}&limit=${limit}`);
  },

  // Scheduling
  getExportSettings: async (reportId: string): Promise<ExportSettings[]> => {
    return api.get<ExportSettings[]>(`/analytics/reports/${reportId}/export-settings`);
  },

  createExportSettings: async (reportId: string, settings: Omit<ExportSettings, 'id' | 'report_id' | 'created_at' | 'updated_at'>): Promise<ExportSettings> => {
    return api.post<ExportSettings>(`/analytics/reports/${reportId}/export-settings`, settings);
  },

  updateExportSettings: async (reportId: string, settingsId: string, updates: Partial<ExportSettings>): Promise<ExportSettings> => {
    return api.put<ExportSettings>(`/analytics/reports/${reportId}/export-settings/${settingsId}`, updates);
  },

  deleteExportSettings: async (reportId: string, settingsId: string): Promise<void> => {
    await api.delete(`/analytics/reports/${reportId}/export-settings/${settingsId}`);
  },

  // Access control
  getReportAccess: async (reportId: string): Promise<UserAccess[]> => {
    return api.get<UserAccess[]>(`/analytics/reports/${reportId}/access`);
  },

  grantAccess: async (reportId: string, userId: string, permissionLevel: 'view' | 'edit' | 'admin'): Promise<UserAccess> => {
    return api.post<UserAccess>(`/analytics/reports/${reportId}/access`, {
      user_id: userId,
      permission_level: permissionLevel,
    });
  },

  updateAccess: async (reportId: string, accessId: string, permissionLevel: 'view' | 'edit' | 'admin'): Promise<UserAccess> => {
    return api.put<UserAccess>(`/analytics/reports/${reportId}/access/${accessId}`, {
      permission_level: permissionLevel,
    });
  },

  revokeAccess: async (reportId: string, accessId: string): Promise<void> => {
    await api.delete(`/analytics/reports/${reportId}/access/${accessId}`);
  },

  // Report generation jobs
  getGenerationJobs: async (page = 1, limit = 20): Promise<{
    jobs: ReportGenerationJob[];
    total: number;
  }> => {
    return api.get<{
      jobs: ReportGenerationJob[];
      total: number;
    }>(`/analytics/generation-jobs?page=${page}&limit=${limit}`);
  },

  getGenerationJob: async (jobId: string): Promise<ReportGenerationJob> => {
    return api.get<ReportGenerationJob>(`/analytics/generation-jobs/${jobId}`);
  },

  cancelGenerationJob: async (jobId: string): Promise<void> => {
    await api.post(`/analytics/generation-jobs/${jobId}/cancel`, {});
  },

  // Favorites
  toggleFavorite: async (reportId: string): Promise<{ is_favorite: boolean }> => {
    return api.post(`/analytics/reports/${reportId}/favorite`, {});
  },

  getFavoriteReports: async (): Promise<SavedReport[]> => {
    return api.get<SavedReport[]>('/analytics/reports/favorites');
  },

  // Search and filters
  searchReports: async (query: string, filters?: {
    type?: 'prebuilt' | 'custom';
    category?: string;
    tags?: string[];
    created_by?: string;
  }): Promise<SavedReport[]> => {
    return api.post<SavedReport[]>('/analytics/reports/search', {
      query,
      filters,
    });
  },

  // Analytics data endpoints
  getDetentionReport: async (filters?: ReportFilters): Promise<ReportData> => {
    return api.post<ReportData>('/analytics/reports/detention', { filters });
  },

  getUtilizationReport: async (filters?: ReportFilters): Promise<ReportData> => {
    return api.post<ReportData>('/analytics/reports/utilization', { filters });
  },

  getSLAComplianceReport: async (filters?: ReportFilters): Promise<ReportData> => {
    return api.post<ReportData>('/analytics/reports/sla-compliance', { filters });
  },

  getCarrierPerformanceReport: async (filters?: ReportFilters): Promise<ReportData> => {
    return api.post<ReportData>('/analytics/reports/carrier-performance', { filters });
  },

  getBillingDisputesReport: async (filters?: ReportFilters): Promise<ReportData> => {
    return api.post<ReportData>('/analytics/reports/billing-disputes', { filters });
  },

  // Warehouse and dock data for filters
  getWarehouses: async (): Promise<Array<{ id: string; name: string; address: string }>> => {
    return api.get<Array<{ id: string; name: string; address: string }>>('/analytics/warehouses');
  },

  getDocks: async (warehouseId?: string): Promise<Array<{ id: string; name: string; warehouse_id: string }>> => {
    const params = warehouseId ? `?warehouse_id=${warehouseId}` : '';
    return api.get<Array<{ id: string; name: string; warehouse_id: string }>>(`/analytics/docks${params}`);
  },

  getCarriers: async (): Promise<Array<{ id: string; name: string; contact_email: string }>> => {
    return api.get<Array<{ id: string; name: string; contact_email: string }>>('/analytics/carriers');
  },

  getCargoTypes: async (): Promise<Array<{ id: string; name: string; adr_class?: string }>> => {
    return api.get<Array<{ id: string; name: string; adr_class?: string }>>('/analytics/cargo-types');
  },
};