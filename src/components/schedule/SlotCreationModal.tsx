import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  Users, 
  Settings, 
  Calendar,
  Repeat,
  AlertCircle
} from 'lucide-react';
import type { CreateSlotRuleInput, Dock, SlotRule } from '@/types/schedule';

const slotRuleSchema = z.object({
  dock_id: z.string().min(1, 'Dock is required'),
  name: z.string().min(1, 'Name is required'),
  duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  buffer_minutes: z.number().min(0, 'Buffer cannot be negative'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  overbooking_policy: z.enum(['none', 'limited', 'unlimited']),
  recurrence_pattern: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurrence_days: z.array(z.number()).optional(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
});

type SlotRuleFormData = z.infer<typeof slotRuleSchema>;

interface SlotCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSlotRuleInput) => void;
  docks: Dock[];
  editingRule?: SlotRule;
  isLoading?: boolean;
}

export function SlotCreationModal({
  isOpen,
  onClose,
  onSubmit,
  docks,
  editingRule,
  isLoading = false,
}: SlotCreationModalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SlotRuleFormData>({
    resolver: zodResolver(slotRuleSchema),
    defaultValues: {
      dock_id: editingRule?.dock_id || '',
      name: editingRule?.name || '',
      duration_minutes: editingRule?.duration_minutes || 60,
      buffer_minutes: editingRule?.buffer_minutes || 15,
      capacity: editingRule?.capacity || 1,
      overbooking_policy: editingRule?.overbooking_policy || 'none',
      recurrence_pattern: editingRule?.recurrence_pattern,
      start_time: editingRule?.start_time || '09:00',
      end_time: editingRule?.end_time || '17:00',
    },
  });

  const watchedRecurrencePattern = watch('recurrence_pattern');
  const watchedOverbookingPolicy = watch('overbooking_policy');

  useEffect(() => {
    if (editingRule) {
      setSelectedDays(editingRule.recurrence_days || []);
      setRecurrencePattern(editingRule.recurrence_pattern);
    }
  }, [editingRule]);

  useEffect(() => {
    setRecurrencePattern(watchedRecurrencePattern);
  }, [watchedRecurrencePattern]);

  const handleDayToggle = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    setValue('recurrence_days', newDays);
  };

  const handleFormSubmit = (data: SlotRuleFormData) => {
    const submitData: CreateSlotRuleInput = {
      ...data,
      recurrence_days: recurrencePattern === 'daily' ? undefined : selectedDays.length > 0 ? selectedDays : undefined,
    };
    onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    setSelectedDays([]);
    setRecurrencePattern(undefined);
    onClose();
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayNumbers = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

  const getOverbookingDescription = (policy: string) => {
    switch (policy) {
      case 'none':
        return 'No overbooking allowed. Bookings will be rejected if capacity is exceeded.';
      case 'limited':
        return 'Limited overbooking allowed. System will warn but allow bookings up to 120% capacity.';
      case 'unlimited':
        return 'Unlimited overbooking allowed. No capacity restrictions enforced.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-coral-500" />
            {editingRule ? 'Edit Slot Rule' : 'Create Slot Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4 text-coral-500" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Morning Slots"
                    className={cn(errors.name && 'border-red-500')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dock_id">Dock</Label>
                  <Select
                    value={watch('dock_id')}
                    onValueChange={(value) => setValue('dock_id', value)}
                  >
                    <SelectTrigger className={cn(errors.dock_id && 'border-red-500')}>
                      <SelectValue placeholder="Select a dock" />
                    </SelectTrigger>
                    <SelectContent>
                      {docks.map(dock => (
                        <SelectItem key={dock.id} value={dock.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-coral-500" />
                            {dock.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dock_id && (
                    <p className="text-sm text-red-500">{errors.dock_id.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Configuration */}
            <Card className="dockflow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-coral-500" />
                  Time Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      {...register('start_time')}
                      className={cn(errors.start_time && 'border-red-500')}
                    />
                    {errors.start_time && (
                      <p className="text-sm text-red-500">{errors.start_time.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      {...register('end_time')}
                      className={cn(errors.end_time && 'border-red-500')}
                    />
                    {errors.end_time && (
                      <p className="text-sm text-red-500">{errors.end_time.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      min="15"
                      step="15"
                      {...register('duration_minutes', { valueAsNumber: true })}
                      className={cn(errors.duration_minutes && 'border-red-500')}
                    />
                    {errors.duration_minutes && (
                      <p className="text-sm text-red-500">{errors.duration_minutes.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buffer_minutes">Buffer (minutes)</Label>
                    <Input
                      id="buffer_minutes"
                      type="number"
                      min="0"
                      step="5"
                      {...register('buffer_minutes', { valueAsNumber: true })}
                      className={cn(errors.buffer_minutes && 'border-red-500')}
                    />
                    {errors.buffer_minutes && (
                      <p className="text-sm text-red-500">{errors.buffer_minutes.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Capacity and Overbooking */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-coral-500" />
                Capacity & Overbooking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register('capacity', { valueAsNumber: true })}
                  className={cn(errors.capacity && 'border-red-500')}
                />
                {errors.capacity && (
                  <p className="text-sm text-red-500">{errors.capacity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="overbooking_policy">Overbooking Policy</Label>
                <Select
                  value={watch('overbooking_policy')}
                  onValueChange={(value) => setValue('overbooking_policy', value as any)}
                >
                  <SelectTrigger className={cn(errors.overbooking_policy && 'border-red-500')}>
                    <SelectValue placeholder="Select overbooking policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Overbooking</SelectItem>
                    <SelectItem value="limited">Limited Overbooking</SelectItem>
                    <SelectItem value="unlimited">Unlimited Overbooking</SelectItem>
                  </SelectContent>
                </Select>
                {errors.overbooking_policy && (
                  <p className="text-sm text-red-500">{errors.overbooking_policy.message}</p>
                )}
                <p className="text-sm text-gray-600">
                  {getOverbookingDescription(watchedOverbookingPolicy)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recurrence Pattern */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Repeat className="h-4 w-4 text-coral-500" />
                Recurrence Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurrence_pattern">Pattern</Label>
                <Select
                  value={watch('recurrence_pattern') || ''}
                  onValueChange={(value) => setValue('recurrence_pattern', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recurrencePattern === 'weekly' && (
                <div className="space-y-3">
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNumbers.map((dayNum, index) => (
                      <div key={dayNum} className="text-center">
                        <Checkbox
                          id={`day-${dayNum}`}
                          checked={selectedDays.includes(dayNum)}
                          onCheckedChange={() => handleDayToggle(dayNum)}
                        />
                        <label
                          htmlFor={`day-${dayNum}`}
                          className="block text-xs mt-1 cursor-pointer"
                        >
                          {dayNames[index].slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recurrencePattern === 'monthly' && (
                <div className="space-y-3">
                  <Label>Select Days of Month</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <div key={day} className="text-center">
                        <Checkbox
                          id={`month-day-${day}`}
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => handleDayToggle(day)}
                        />
                        <label
                          htmlFor={`month-day-${day}`}
                          className="block text-xs mt-1 cursor-pointer"
                        >
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="dockflow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-coral-500" />
                Rule Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{watch('name') || 'Rule Name'}</Badge>
                  <Badge variant="secondary">
                    {watch('start_time')} - {watch('end_time')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-coral-500" />
                    <span>{watch('duration_minutes')} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-coral-500" />
                    <span>{watch('capacity')} capacity</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4 text-coral-500" />
                    <span>{watch('buffer_minutes')} min buffer</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-coral-500" />
                    <span className="capitalize">{watch('overbooking_policy')}</span>
                  </div>
                </div>

                {recurrencePattern && (
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-coral-500" />
                    <span className="text-sm">
                      {recurrencePattern === 'daily' && 'Every day'}
                      {recurrencePattern === 'weekly' && `Weekly on ${selectedDays.map(d => dayNames[dayNumbers.indexOf(d)]).join(', ')}`}
                      {recurrencePattern === 'monthly' && `Monthly on days ${selectedDays.join(', ')}`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Creating...' : editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}