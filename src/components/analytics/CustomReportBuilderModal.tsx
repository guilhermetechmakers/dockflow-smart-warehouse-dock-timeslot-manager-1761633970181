import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { CustomReportBuilder } from '@/types/analytics';

const customReportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  metrics: z.array(z.object({
    metric_name: z.string().min(1, 'Metric name is required'),
    metric_type: z.enum(['count', 'average', 'sum', 'percentage', 'ratio']),
    grouping: z.array(z.string()).min(1, 'At least one grouping is required'),
  })).min(1, 'At least one metric is required'),
  date_range: z.object({
    start: z.string().min(1, 'Start date is required'),
    end: z.string().min(1, 'End date is required'),
  }),
  chart_type: z.enum(['line', 'bar', 'pie', 'heatmap', 'histogram']),
  is_public: z.boolean(),
  tags: z.array(z.string()),
});

type CustomReportFormData = z.infer<typeof customReportSchema>;

interface CustomReportBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomReportBuilder) => void;
  isLoading?: boolean;
}

const availableMetrics = [
  { id: 'total_bookings', name: 'Total Bookings', type: 'count' as const },
  { id: 'avg_detention_time', name: 'Average Detention Time', type: 'average' as const },
  { id: 'dock_utilization', name: 'Dock Utilization', type: 'percentage' as const },
  { id: 'on_time_percentage', name: 'On-Time Percentage', type: 'percentage' as const },
  { id: 'total_revenue', name: 'Total Revenue', type: 'sum' as const },
  { id: 'carrier_performance', name: 'Carrier Performance', type: 'ratio' as const },
];

const availableGroupings = [
  { id: 'warehouse', name: 'Warehouse' },
  { id: 'dock', name: 'Dock' },
  { id: 'carrier', name: 'Carrier' },
  { id: 'cargo_type', name: 'Cargo Type' },
  { id: 'date', name: 'Date' },
  { id: 'hour', name: 'Hour' },
  { id: 'day_of_week', name: 'Day of Week' },
  { id: 'month', name: 'Month' },
];

const chartTypes = [
  { id: 'line', name: 'Line Chart', icon: TrendingUp },
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'heatmap', name: 'Heatmap', icon: Activity },
  { id: 'histogram', name: 'Histogram', icon: Hash },
];

export function CustomReportBuilderModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: CustomReportBuilderModalProps) {
  const [newTag, setNewTag] = useState('');
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_type: 'count' as const,
    grouping: [] as string[],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CustomReportFormData>({
    resolver: zodResolver(customReportSchema),
    defaultValues: {
      name: '',
      description: '',
      metrics: [],
      date_range: {
        start: '',
        end: '',
      },
      chart_type: 'line',
      is_public: false,
      tags: [],
    },
  });

  const watchedValues = watch();

  const addMetric = () => {
    if (newMetric.metric_name && newMetric.grouping.length > 0) {
      const currentMetrics = watchedValues.metrics || [];
      setValue('metrics', [...currentMetrics, newMetric]);
      setNewMetric({
        metric_name: '',
        metric_type: 'count',
        grouping: [],
      });
    }
  };

  const removeMetric = (index: number) => {
    const currentMetrics = watchedValues.metrics || [];
    setValue('metrics', currentMetrics.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !watchedValues.tags?.includes(newTag.trim())) {
      const currentTags = watchedValues.tags || [];
      setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = watchedValues.tags || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleFormSubmit = (data: CustomReportFormData) => {
    const reportData: CustomReportBuilder = {
      ...data,
      filters: {} // Add empty filters object as required by the type
    };
    onSubmit(reportData);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Report</DialogTitle>
          <DialogDescription>
            Build a custom analytics report with your preferred metrics and visualizations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter report name"
                  className={cn(errors.name && 'border-red-500')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="chart_type">Chart Type *</Label>
                <Select
                  value={watchedValues.chart_type}
                  onValueChange={(value) => setValue('chart_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter report description"
                rows={3}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Date Range *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedValues.date_range?.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedValues.date_range?.start ? (
                        format(new Date(watchedValues.date_range.start), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedValues.date_range?.start ? new Date(watchedValues.date_range.start) : undefined}
                      onSelect={(date) => 
                        setValue('date_range.start', date ? date.toISOString().split('T')[0] : '')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date_range?.start && (
                  <p className="text-sm text-red-500">{errors.date_range.start.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedValues.date_range?.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedValues.date_range?.end ? (
                        format(new Date(watchedValues.date_range.end), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchedValues.date_range?.end ? new Date(watchedValues.date_range.end) : undefined}
                      onSelect={(date) => 
                        setValue('date_range.end', date ? date.toISOString().split('T')[0] : '')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date_range?.end && (
                  <p className="text-sm text-red-500">{errors.date_range.end.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Metrics *</Label>
            <div className="space-y-4">
              {/* Existing Metrics */}
              {watchedValues.metrics?.map((metric, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.metric_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMetric(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Type: {metric.metric_type} | Grouping: {metric.grouping.join(', ')}
                  </div>
                </div>
              ))}

              {/* Add New Metric */}
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Metric Name</Label>
                    <Select
                      value={newMetric.metric_name}
                      onValueChange={(value) => setNewMetric(prev => ({ ...prev, metric_name: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMetrics.map((metric) => (
                          <SelectItem key={metric.id} value={metric.id}>
                            {metric.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Type</Label>
                    <Select
                      value={newMetric.metric_type}
                      onValueChange={(value) => setNewMetric(prev => ({ ...prev, metric_type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="ratio">Ratio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Grouping</Label>
                    <div className="flex flex-wrap gap-1">
                      {availableGroupings.map((group) => (
                        <label key={group.id} className="flex items-center space-x-1 text-xs">
                          <Checkbox
                            checked={newMetric.grouping.includes(group.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewMetric(prev => ({
                                  ...prev,
                                  grouping: [...prev.grouping, group.id]
                                }));
                              } else {
                                setNewMetric(prev => ({
                                  ...prev,
                                  grouping: prev.grouping.filter(g => g !== group.id)
                                }));
                              }
                            }}
                          />
                          <span>{group.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMetric}
                  disabled={!newMetric.metric_name || newMetric.grouping.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Metric
                </Button>
              </div>
            </div>
            {errors.metrics && (
              <p className="text-sm text-red-500">{errors.metrics.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Tags</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {watchedValues.tags && watchedValues.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={watchedValues.is_public}
                onCheckedChange={(checked) => setValue('is_public', !!checked)}
              />
              <Label htmlFor="is_public" className="text-sm">
                Make this report public (visible to all users)
              </Label>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit(handleFormSubmit)} 
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Creating...' : 'Create Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}