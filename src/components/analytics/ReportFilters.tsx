import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  X, 
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ReportFilters } from '@/types/analytics';

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onExport?: () => void;
  warehouses?: Array<{ id: string; name: string }>;
  docks?: Array<{ id: string; name: string; warehouse_id: string }>;
  carriers?: Array<{ id: string; name: string }>;
  cargoTypes?: Array<{ id: string; name: string; adr_class?: string }>;
  isLoading?: boolean;
  className?: string;
}

export function ReportFiltersComponent({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  onExport,
  warehouses = [],
  docks = [],
  carriers = [],
  cargoTypes = [],
  isLoading = false,
  className
}: ReportFiltersProps) {

  const updateFilters = (updates: Partial<ReportFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const removeFilter = (key: keyof ReportFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.warehouses?.length) count++;
    if (filters.docks?.length) count++;
    if (filters.carriers?.length) count++;
    if (filters.cargo_types?.length) count++;
    if (filters.adr_classes?.length) count++;
    if (filters.status?.length) count++;
    if (filters.temperature_ranges?.length) count++;
    return count;
  };

  const filteredDocks = filters.warehouses?.length 
    ? docks.filter(dock => filters.warehouses!.includes(dock.warehouse_id))
    : docks;

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
            <Button
              size="sm"
              onClick={onApply}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              Apply
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.date_range.start && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date_range.start ? (
                      format(new Date(filters.date_range.start), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date_range.start ? new Date(filters.date_range.start) : undefined}
                    onSelect={(date) => 
                      updateFilters({
                        date_range: {
                          ...filters.date_range,
                          start: date ? date.toISOString().split('T')[0] : ''
                        }
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.date_range.end && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date_range.end ? (
                      format(new Date(filters.date_range.end), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date_range.end ? new Date(filters.date_range.end) : undefined}
                    onSelect={(date) => 
                      updateFilters({
                        date_range: {
                          ...filters.date_range,
                          end: date ? date.toISOString().split('T')[0] : ''
                        }
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Warehouses */}
        {warehouses.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Warehouses</Label>
            <Select
              value={filters.warehouses?.[0] || ''}
              onValueChange={(value) => 
                updateFilters({ 
                  warehouses: value ? [value] : undefined 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Warehouses</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Docks */}
        {filteredDocks.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Docks</Label>
            <Select
              value={filters.docks?.[0] || ''}
              onValueChange={(value) => 
                updateFilters({ 
                  docks: value ? [value] : undefined 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Docks</SelectItem>
                {filteredDocks.map((dock) => (
                  <SelectItem key={dock.id} value={dock.id}>
                    {dock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Carriers */}
        {carriers.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Carriers</Label>
            <Select
              value={filters.carriers?.[0] || ''}
              onValueChange={(value) => 
                updateFilters({ 
                  carriers: value ? [value] : undefined 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Carriers</SelectItem>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Cargo Types */}
        {cargoTypes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cargo Types</Label>
            <Select
              value={filters.cargo_types?.[0] || ''}
              onValueChange={(value) => 
                updateFilters({ 
                  cargo_types: value ? [value] : undefined 
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cargo type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cargo Types</SelectItem>
                {cargoTypes.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.name}
                    {cargo.adr_class && ` (ADR ${cargo.adr_class})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={filters.status?.[0] || ''}
            onValueChange={(value) => 
              updateFilters({ 
                status: value ? [value] : undefined 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="arrived">Arrived</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.warehouses?.map((id) => {
                const warehouse = warehouses.find(w => w.id === id);
                return warehouse ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    Warehouse: {warehouse.name}
                    <button
                      onClick={() => removeFilter('warehouses')}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
              {filters.docks?.map((id) => {
                const dock = docks.find(d => d.id === id);
                return dock ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    Dock: {dock.name}
                    <button
                      onClick={() => removeFilter('docks')}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
              {filters.carriers?.map((id) => {
                const carrier = carriers.find(c => c.id === id);
                return carrier ? (
                  <Badge key={id} variant="secondary" className="text-xs">
                    Carrier: {carrier.name}
                    <button
                      onClick={() => removeFilter('carriers')}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
              {filters.status?.map((status) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  Status: {status}
                  <button
                    onClick={() => removeFilter('status')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}