import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Download, 
  Calendar as CalendarIcon, 
  FileText, 
  FileSpreadsheet,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { ScheduleExportOptions } from '@/types/schedule';

interface ScheduleExportProps {
  onExport: (options: ScheduleExportOptions) => void;
  isLoading?: boolean;
  className?: string;
}

export function ScheduleExport({ onExport, isLoading = false, className }: ScheduleExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ScheduleExportOptions>({
    format: 'csv',
    date_range: {
      start: format(new Date(), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
    include_details: true,
    include_conflicts: false,
    group_by: undefined,
  });

  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Comma-separated values for Excel',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: 'excel' as const,
      label: 'Excel',
      description: 'Microsoft Excel format',
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    {
      value: 'pdf' as const,
      label: 'PDF',
      description: 'Portable Document Format',
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const groupByOptions = [
    { value: 'dock', label: 'Dock', description: 'Group by dock location' },
    { value: 'carrier', label: 'Carrier', description: 'Group by carrier company' },
    { value: 'date', label: 'Date', description: 'Group by date' },
    { value: 'status', label: 'Status', description: 'Group by booking status' },
  ];

  const handleExport = () => {
    onExport(exportOptions);
    setIsOpen(false);
  };

  const handleFormatChange = (format: 'csv' | 'excel' | 'pdf') => {
    setExportOptions(prev => ({ ...prev, format }));
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    if (date) {
      setExportOptions(prev => ({
        ...prev,
        date_range: {
          ...prev.date_range,
          [field]: format(date, 'yyyy-MM-dd'),
        },
      }));
    }
  };

  const handleOptionChange = (key: keyof ScheduleExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const getFormatIcon = (format: string) => {
    const option = formatOptions.find(opt => opt.value === format);
    return option?.icon || <FileText className="h-4 w-4" />;
  };

  const getFormatDescription = (format: string) => {
    const option = formatOptions.find(opt => opt.value === format);
    return option?.description || '';
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
        disabled={isLoading}
      >
        <Download className="h-4 w-4" />
        Export Schedule
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-coral-500" />
              Export Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Format Selection */}
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4 text-coral-500" />
                  Export Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formatOptions.map(option => (
                    <div
                      key={option.value}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                        exportOptions.format === option.value
                          ? "border-coral-500 bg-coral-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => handleFormatChange(option.value)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {option.icon}
                        <span className="font-medium text-dark">{option.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-coral-500" />
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark mb-2 block">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(new Date(exportOptions.date_range.start), 'MMM d, yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(exportOptions.date_range.start)}
                          onSelect={(date) => handleDateRangeChange('start', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-2 block">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(new Date(exportOptions.date_range.end), 'MMM d, yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(exportOptions.date_range.end)}
                          onSelect={(date) => handleDateRangeChange('end', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4 text-coral-500" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-details"
                      checked={exportOptions.include_details}
                      onCheckedChange={(checked) => 
                        handleOptionChange('include_details', checked)
                      }
                    />
                    <label
                      htmlFor="include-details"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Include detailed information
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Include carrier details, cargo information, and special requirements
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-conflicts"
                      checked={exportOptions.include_conflicts}
                      onCheckedChange={(checked) => 
                        handleOptionChange('include_conflicts', checked)
                      }
                    />
                    <label
                      htmlFor="include-conflicts"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Include conflict information
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Include any scheduling conflicts and their resolutions
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-dark">Group By</label>
                  <Select
                    value={exportOptions.group_by || ''}
                    onValueChange={(value) => 
                      handleOptionChange('group_by', value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      {groupByOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Export Preview */}
            <Card className="dockflow-card bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4 text-coral-500" />
                  Export Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getFormatIcon(exportOptions.format)}
                    <span className="font-medium text-dark">
                      {formatOptions.find(opt => opt.value === exportOptions.format)?.label} Export
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {exportOptions.format.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {getFormatDescription(exportOptions.format)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-coral-500" />
                      <span>
                        {format(new Date(exportOptions.date_range.start), 'MMM d')} - {format(new Date(exportOptions.date_range.end), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-coral-500" />
                      <span>
                        {exportOptions.group_by ? `Grouped by ${groupByOptions.find(opt => opt.value === exportOptions.group_by)?.label}` : 'No grouping'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exportOptions.include_details && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Details included
                      </Badge>
                    )}
                    {exportOptions.include_conflicts && (
                      <Badge variant="secondary" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Conflicts included
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Exporting...' : 'Export Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}