import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Analytics Components
import { KPICard } from '@/components/analytics/KPICard';
import { ReportCard } from '@/components/analytics/ReportCard';
import { ReportTemplateCard } from '@/components/analytics/ReportTemplateCard';
import { ReportFiltersComponent } from '@/components/analytics/ReportFilters';
import { CustomReportBuilderModal } from '@/components/analytics/CustomReportBuilderModal';
import { ExportOptionsModal } from '@/components/analytics/ExportOptionsModal';

// Hooks
import {
  useAnalyticsOverview,
  useKPIs,
  useReports,
  usePrebuiltReports,
  useReportTemplates,
  useWarehouses,
  useDocks,
  useCarriers,
  useCargoTypes,
  useCreateReport,
  useDeleteReport,
  useDuplicateReport,
  useExportReport,
  useToggleFavorite,
} from '@/hooks/useAnalytics';

import type { ReportFilters, CustomReportBuilder } from '@/types/analytics';

export function AnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<ReportFilters>({
    date_range: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0], // today
    },
  });

  // Data fetching
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: kpis, isLoading: kpisLoading } = useKPIs(filters);
  const { data: reportsData, isLoading: reportsLoading } = useReports(1, 20, searchQuery);
  const { data: prebuiltReports, isLoading: prebuiltLoading } = usePrebuiltReports();
  const { data: templates, isLoading: templatesLoading } = useReportTemplates();
  const { data: warehouses } = useWarehouses();
  const { data: docks } = useDocks(filters.warehouses?.[0]);
  const { data: carriers } = useCarriers();
  const { data: cargoTypes } = useCargoTypes();

  // Mutations
  const createReportMutation = useCreateReport();
  const deleteReportMutation = useDeleteReport();
  const duplicateReportMutation = useDuplicateReport();
  const exportReportMutation = useExportReport();
  const toggleFavoriteMutation = useToggleFavorite();

  const handleCreateReport = (data: CustomReportBuilder) => {
    createReportMutation.mutate(data);
  };

  const handleViewReport = (id: string) => {
    setSelectedReport(id);
    // Navigate to report detail or open in modal
  };

  const handleEditReport = (id: string) => {
    // Navigate to edit page or open edit modal
    console.log('Edit report:', id);
  };

  const handleDuplicateReport = (id: string) => {
    const newName = `Copy of ${reportsData?.reports.find(r => r.id === id)?.name || 'Report'}`;
    duplicateReportMutation.mutate({ id, name: newName });
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteReportMutation.mutate(id);
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const handleExportReport = (id: string) => {
    setSelectedReport(id);
    setShowExportModal(true);
  };

  const handleShareReport = (id: string) => {
    // Implement sharing functionality
    console.log('Share report:', id);
  };

  const handleExport = (data: any) => {
    if (selectedReport) {
      exportReportMutation.mutate({
        id: selectedReport,
        format: data.format,
        filters,
      });
    }
  };

  const handleScheduleExport = (data: any) => {
    // Implement scheduled export
    console.log('Schedule export:', data);
  };

  const handleUseTemplate = (templateId: string) => {
    // Navigate to create report with template
    console.log('Use template:', templateId);
  };

  const handlePreviewTemplate = (templateId: string) => {
    // Show template preview
    console.log('Preview template:', templateId);
  };

  const handleApplyFilters = () => {
    // Filters are already applied through the filters state
    console.log('Applying filters:', filters);
  };

  const handleExportFilters = () => {
    // Export current filtered data
    console.log('Export with filters:', filters);
  };

  const prebuiltReportCategories = [
    { id: 'detention', name: 'Detention Reports', icon: Clock, color: 'text-orange-600 bg-orange-100' },
    { id: 'utilization', name: 'Utilization Reports', icon: BarChart3, color: 'text-blue-600 bg-blue-100' },
    { id: 'sla', name: 'SLA Compliance', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
    { id: 'performance', name: 'Performance', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { id: 'billing', name: 'Billing & Disputes', icon: DollarSign, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate insights and reports to optimize your warehouse operations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowCustomBuilder(true)}
            className="btn-outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
          <Button
            onClick={() => setShowCustomBuilder(true)}
            className="btn-primary"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Custom Builder
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" onClick={() => setActiveTab('filters')}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="prebuilt">Prebuilt</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark">Key Performance Indicators</h2>
            {kpisLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis?.map((kpi) => (
                  <KPICard key={kpi.id} kpi={kpi} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dockflow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-coral-500" />
                    <span>Total Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-dark">{overview?.total_reports || 0}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {overview?.custom_reports || 0} custom, {overview?.prebuilt_reports || 0} prebuilt
                  </p>
                </CardContent>
              </Card>

              <Card className="dockflow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Download className="h-5 w-5 text-green-500" />
                    <span>Exports This Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-dark">{overview?.last_30_days_exports || 0}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {overview?.total_exports || 0} total exports
                  </p>
                </CardContent>
              </Card>

              <Card className="dockflow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span>Scheduled Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-dark">{overview?.scheduled_reports || 0}</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Automated exports
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Reports */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-dark">Recent Reports</h2>
            {reportsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportsData?.reports.slice(0, 6).map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={handleViewReport}
                    onEdit={handleEditReport}
                    onDuplicate={handleDuplicateReport}
                    onDelete={handleDeleteReport}
                    onToggleFavorite={handleToggleFavorite}
                    onExport={handleExportReport}
                    onShare={handleShareReport}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark">My Reports</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomBuilder(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Report
              </Button>
            </div>
          </div>

          {reportsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportsData?.reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onView={handleViewReport}
                  onEdit={handleEditReport}
                  onDuplicate={handleDuplicateReport}
                  onDelete={handleDeleteReport}
                  onToggleFavorite={handleToggleFavorite}
                  onExport={handleExportReport}
                  onShare={handleShareReport}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark">Report Templates</h2>
            <p className="text-sm text-gray-600">
              Start with a template to quickly create common reports
            </p>
          </div>

          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <ReportTemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onPreview={handlePreviewTemplate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Prebuilt Reports Tab */}
        <TabsContent value="prebuilt" className="space-y-6">
          <h2 className="text-xl font-semibold text-dark">Prebuilt Reports</h2>
          
          <div className="space-y-6">
            {prebuiltReportCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', category.color)}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark">{category.name}</h3>
                </div>
                
                {prebuiltLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prebuiltReports
                      ?.filter(report => report.category === category.id)
                      .map((report) => (
                        <ReportTemplateCard
                          key={report.id}
                          template={report}
                          onUse={handleUseTemplate}
                          onPreview={handlePreviewTemplate}
                        />
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-6">
          <h2 className="text-xl font-semibold text-dark">Report Filters</h2>
          
          <ReportFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={() => setFilters({
              date_range: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0],
              },
            })}
            onExport={handleExportFilters}
            warehouses={warehouses}
            docks={docks}
            carriers={carriers}
            cargoTypes={cargoTypes}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CustomReportBuilderModal
        isOpen={showCustomBuilder}
        onClose={() => setShowCustomBuilder(false)}
        onSubmit={handleCreateReport}
        isLoading={createReportMutation.isPending}
      />

      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        onSchedule={handleScheduleExport}
        reportName={reportsData?.reports.find(r => r.id === selectedReport)?.name || 'Report'}
        isLoading={exportReportMutation.isPending}
      />
    </div>
  );
}
