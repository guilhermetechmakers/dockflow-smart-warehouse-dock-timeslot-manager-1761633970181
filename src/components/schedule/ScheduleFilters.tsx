import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  MapPin, 
  Truck, 
  Package, 
  AlertTriangle,
  Thermometer,
  Flame
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { ScheduleFilter, Dock, Carrier, CargoType, BookingStatus } from '@/types/schedule';

interface ScheduleFiltersProps {
  filters: ScheduleFilter;
  onFiltersChange: (filters: ScheduleFilter) => void;
  docks: Dock[];
  carriers: Carrier[];
  cargoTypes: CargoType[];
  isLoading?: boolean;
  className?: string;
}

export function ScheduleFilters({
  filters,
  onFiltersChange,
  docks,
  carriers,
  cargoTypes,
  isLoading = false,
  className,
}: ScheduleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ScheduleFilter>(filters);

  const statusOptions: { value: BookingStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'arrived', label: 'Arrived', color: 'bg-green-100 text-green-800' },
    { value: 'waiting', label: 'Waiting', color: 'bg-orange-100 text-orange-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'no_show', label: 'No Show', color: 'bg-gray-100 text-gray-800' },
  ];

  const handleFilterChange = (key: keyof ScheduleFilter, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: ScheduleFilter = {};
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dock_ids?.length) count++;
    if (filters.carrier_ids?.length) count++;
    if (filters.cargo_types?.length) count++;
    if (filters.statuses?.length) count++;
    if (filters.adr_required !== undefined) count++;
    if (filters.temperature_controlled !== undefined) count++;
    if (filters.hazmat !== undefined) count++;
    if (filters.date_range) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <Card className="dockflow-card animate-fade-in-down">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-coral-500" />
              Schedule Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-coral-500" />
                Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempFilters.date_range?.start 
                          ? format(new Date(tempFilters.date_range.start), 'MMM d, yyyy')
                          : 'Select start date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tempFilters.date_range?.start ? new Date(tempFilters.date_range.start) : undefined}
                        onSelect={(date) => 
                          handleFilterChange('date_range', {
                            ...tempFilters.date_range,
                            start: date?.toISOString().split('T')[0] || '',
                            end: tempFilters.date_range?.end || ''
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tempFilters.date_range?.end 
                          ? format(new Date(tempFilters.date_range.end), 'MMM d, yyyy')
                          : 'Select end date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tempFilters.date_range?.end ? new Date(tempFilters.date_range.end) : undefined}
                        onSelect={(date) => 
                          handleFilterChange('date_range', {
                            ...tempFilters.date_range,
                            end: date?.toISOString().split('T')[0] || ''
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dock Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark flex items-center gap-2">
                <MapPin className="h-4 w-4 text-coral-500" />
                Docks
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {docks.map(dock => (
                  <div key={dock.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dock-${dock.id}`}
                      checked={tempFilters.dock_ids?.includes(dock.id) || false}
                      onCheckedChange={(checked) => {
                        const currentDockIds = tempFilters.dock_ids || [];
                        const newDockIds = checked
                          ? [...currentDockIds, dock.id]
                          : currentDockIds.filter(id => id !== dock.id);
                        handleFilterChange('dock_ids', newDockIds.length > 0 ? newDockIds : undefined);
                      }}
                    />
                    <label
                      htmlFor={`dock-${dock.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {dock.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Carrier Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark flex items-center gap-2">
                <Truck className="h-4 w-4 text-coral-500" />
                Carriers
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {carriers.map(carrier => (
                  <div key={carrier.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`carrier-${carrier.id}`}
                      checked={tempFilters.carrier_ids?.includes(carrier.id) || false}
                      onCheckedChange={(checked) => {
                        const currentCarrierIds = tempFilters.carrier_ids || [];
                        const newCarrierIds = checked
                          ? [...currentCarrierIds, carrier.id]
                          : currentCarrierIds.filter(id => id !== carrier.id);
                        handleFilterChange('carrier_ids', newCarrierIds.length > 0 ? newCarrierIds : undefined);
                      }}
                    />
                    <label
                      htmlFor={`carrier-${carrier.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {carrier.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Cargo Type Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark flex items-center gap-2">
                <Package className="h-4 w-4 text-coral-500" />
                Cargo Types
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {cargoTypes.map(cargoType => (
                  <div key={cargoType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cargo-${cargoType.id}`}
                      checked={tempFilters.cargo_types?.includes(cargoType.id) || false}
                      onCheckedChange={(checked) => {
                        const currentCargoTypes = tempFilters.cargo_types || [];
                        const newCargoTypes = checked
                          ? [...currentCargoTypes, cargoType.id]
                          : currentCargoTypes.filter(id => id !== cargoType.id);
                        handleFilterChange('cargo_types', newCargoTypes.length > 0 ? newCargoTypes : undefined);
                      }}
                    />
                    <label
                      htmlFor={`cargo-${cargoType.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {cargoType.description}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-coral-500" />
                Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {statusOptions.map(status => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={tempFilters.statuses?.includes(status.value) || false}
                      onCheckedChange={(checked) => {
                        const currentStatuses = tempFilters.statuses || [];
                        const newStatuses = checked
                          ? [...currentStatuses, status.value]
                          : currentStatuses.filter(s => s !== status.value);
                        handleFilterChange('statuses', newStatuses.length > 0 ? newStatuses : undefined);
                      }}
                    />
                    <label
                      htmlFor={`status-${status.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Special Requirements Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark">Special Requirements</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="adr-required"
                    checked={tempFilters.adr_required === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('adr_required', checked ? true : undefined)
                    }
                  />
                  <label
                    htmlFor="adr-required"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                  >
                    <Flame className="h-3 w-3 text-red-500" />
                    ADR Required
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="temperature-controlled"
                    checked={tempFilters.temperature_controlled === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('temperature_controlled', checked ? true : undefined)
                    }
                  />
                  <label
                    htmlFor="temperature-controlled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                  >
                    <Thermometer className="h-3 w-3 text-blue-500" />
                    Temperature Controlled
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hazmat"
                    checked={tempFilters.hazmat === true}
                    onCheckedChange={(checked) => 
                      handleFilterChange('hazmat', checked ? true : undefined)
                    }
                  />
                  <label
                    htmlFor="hazmat"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    Hazmat
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="btn-primary"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.dock_ids?.map(dockId => {
            const dock = docks.find(d => d.id === dockId);
            return dock ? (
              <Badge key={dockId} variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {dock.name}
                <button
                  onClick={() => {
                    const newDockIds = filters.dock_ids?.filter(id => id !== dockId);
                    onFiltersChange({ ...filters, dock_ids: newDockIds?.length ? newDockIds : undefined });
                  }}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          
          {filters.carrier_ids?.map(carrierId => {
            const carrier = carriers.find(c => c.id === carrierId);
            return carrier ? (
              <Badge key={carrierId} variant="secondary" className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                {carrier.name}
                <button
                  onClick={() => {
                    const newCarrierIds = filters.carrier_ids?.filter(id => id !== carrierId);
                    onFiltersChange({ ...filters, carrier_ids: newCarrierIds?.length ? newCarrierIds : undefined });
                  }}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          
          {filters.statuses?.map(status => {
            const statusOption = statusOptions.find(s => s.value === status);
            return statusOption ? (
              <Badge key={status} variant="secondary" className="flex items-center gap-1">
                {statusOption.label}
                <button
                  onClick={() => {
                    const newStatuses = filters.statuses?.filter(s => s !== status);
                    onFiltersChange({ ...filters, statuses: newStatuses?.length ? newStatuses : undefined });
                  }}
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}