export interface Report {
  id: string;
  name: string;
  type: 'prebuilt' | 'custom';
  description?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_public: boolean;
  tags: string[];
}

export interface ReportMetric {
  id: string;
  report_id: string;
  metric_name: string;
  metric_type: 'count' | 'average' | 'sum' | 'percentage' | 'ratio';
  grouping: string[];
  date_range: {
    start: string;
    end: string;
  };
  filters: Record<string, any>;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

export interface ReportData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
  };
}

export interface ExportSettings {
  id: string;
  report_id: string;
  format: 'csv' | 'pdf' | 'excel';
  scheduled_time?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAccess {
  id: string;
  report_id: string;
  user_id: string;
  permission_level: 'view' | 'edit' | 'admin';
  granted_at: string;
  granted_by: string;
}

export interface PrebuiltReport {
  id: string;
  name: string;
  description: string;
  category: 'detention' | 'utilization' | 'sla' | 'performance' | 'billing';
  icon: string;
  metrics: string[];
  default_filters: Record<string, any>;
  chart_type: 'line' | 'bar' | 'pie' | 'heatmap' | 'histogram';
}

export interface CustomReportBuilder {
  name: string;
  description?: string;
  metrics: {
    metric_name: string;
    metric_type: 'count' | 'average' | 'sum' | 'percentage' | 'ratio';
    grouping: string[];
  }[];
  date_range: {
    start: string;
    end: string;
  };
  filters: Record<string, any>;
  chart_type: 'line' | 'bar' | 'pie' | 'heatmap' | 'histogram';
  is_public: boolean;
  tags: string[];
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_featured: boolean;
  metrics_count: number;
  last_used?: string;
}

export interface AnalyticsKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  change_period: string;
  icon: string;
  color: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'heatmap' | 'histogram';
  data: ReportData;
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    scales?: {
      x?: {
        display?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
      y?: {
        display?: boolean;
        title?: {
          display?: boolean;
          text?: string;
        };
      };
    };
  };
}

export interface ReportFilters {
  date_range: {
    start: string;
    end: string;
  };
  warehouses?: string[];
  docks?: string[];
  carriers?: string[];
  cargo_types?: string[];
  adr_classes?: string[];
  status?: string[];
  temperature_ranges?: {
    min: number;
    max: number;
  }[];
}

export interface SavedReport extends Report {
  last_generated?: string;
  generation_count: number;
  is_favorite: boolean;
  shared_with: UserAccess[];
}

export interface ReportGenerationJob {
  id: string;
  report_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  download_url?: string;
}

export interface AnalyticsOverview {
  total_reports: number;
  custom_reports: number;
  prebuilt_reports: number;
  scheduled_reports: number;
  total_exports: number;
  last_30_days_exports: number;
  most_used_report?: string;
  recent_reports: Report[];
  kpis: AnalyticsKPI[];
}