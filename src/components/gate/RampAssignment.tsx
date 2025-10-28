import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  Wrench,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RampAssignment as RampAssignmentType, RampAssignmentForm } from '@/types/gate';

const rampAssignmentSchema = z.object({
  ramp_id: z.string().min(1, 'Ramp selection is required'),
  priority: z.enum(['normal', 'urgent', 'express']),
  notes: z.string().optional(),
});

interface RampAssignmentProps {
  visitId: string;
  currentRamp?: string;
  onAssign: (data: RampAssignmentForm) => Promise<void>;
  onUnassign: () => Promise<void>;
  ramps: RampAssignmentType[];
  className?: string;
}

const priorityConfig = {
  normal: { label: 'Normal', color: 'text-gray-700 bg-gray-100', icon: Clock },
  urgent: { label: 'Urgent', color: 'text-orange-700 bg-orange-100', icon: Zap },
  express: { label: 'Express', color: 'text-red-700 bg-red-100', icon: Wrench },
};

const statusConfig = {
  available: { label: 'Available', color: 'text-green-700 bg-green-100' },
  occupied: { label: 'Occupied', color: 'text-red-700 bg-red-100' },
  maintenance: { label: 'Maintenance', color: 'text-yellow-700 bg-yellow-100' },
};

export function RampAssignment({ 
  currentRamp, 
  onAssign, 
  onUnassign, 
  ramps, 
  className 
}: RampAssignmentProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RampAssignmentForm>({
    resolver: zodResolver(rampAssignmentSchema),
    defaultValues: {
      priority: 'normal',
    },
  });

  const selectedRampId = watch('ramp_id');
  const selectedRamp = ramps.find(r => r.id === selectedRampId);

  const onSubmit = async (data: RampAssignmentForm) => {
    try {
      setIsAssigning(true);
      setError(null);
      setSuccess(null);
      
      await onAssign(data);
      
      setSuccess('Ramp assigned successfully');
      reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign ramp';
      setError(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setIsUnassigning(true);
      setError(null);
      setSuccess(null);
      
      await onUnassign();
      
      setSuccess('Ramp unassigned successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unassign ramp';
      setError(errorMessage);
    } finally {
      setIsUnassigning(false);
    }
  };

  const availableRamps = ramps.filter(r => r.status === 'available');
  const occupiedRamps = ramps.filter(r => r.status === 'occupied');
  const maintenanceRamps = ramps.filter(r => r.status === 'maintenance');

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Ramp Assignment
        </CardTitle>
        {currentRamp && (
          <p className="text-sm text-gray-600">
            Current ramp: <span className="font-medium">{currentRamp}</span>
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Assignment */}
        {currentRamp && (
          <div className="p-4 bg-coral-50 border border-coral-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-coral-600" />
                <span className="font-medium text-coral-800">
                  Currently assigned to: {currentRamp}
                </span>
              </div>
              <Button
                onClick={handleUnassign}
                disabled={isUnassigning}
                variant="outline"
                size="sm"
                className="text-coral-600 border-coral-300 hover:bg-coral-100"
              >
                {isUnassigning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Unassign'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Assignment Form */}
        {!currentRamp && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ramp_id" className="form-label">
                Select Ramp *
              </Label>
              <Select {...register('ramp_id')}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Choose a ramp" />
                </SelectTrigger>
                <SelectContent>
                  {availableRamps.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available ({availableRamps.length})
                      </div>
                      {availableRamps.map((ramp) => (
                        <SelectItem key={ramp.id} value={ramp.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{ramp.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              Priority {ramp.priority}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {occupiedRamps.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mt-2">
                        Occupied ({occupiedRamps.length})
                      </div>
                      {occupiedRamps.map((ramp) => (
                        <SelectItem key={ramp.id} value={ramp.id} disabled>
                          <div className="flex items-center justify-between w-full opacity-50">
                            <span>{ramp.name}</span>
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Occupied
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {maintenanceRamps.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mt-2">
                        Maintenance ({maintenanceRamps.length})
                      </div>
                      {maintenanceRamps.map((ramp) => (
                        <SelectItem key={ramp.id} value={ramp.id} disabled>
                          <div className="flex items-center justify-between w-full opacity-50">
                            <span>{ramp.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Maintenance
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.ramp_id && (
                <p className="text-sm text-red-600">{errors.ramp_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="form-label">
                Priority
              </Label>
              <Select {...register('priority')}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([value, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className={cn('px-2 py-1 rounded text-xs font-medium', config.color)}>
                            {config.label}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="form-label">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Add any special instructions or notes..."
                className="form-input min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isAssigning || !selectedRampId}
              className="w-full btn-primary"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning Ramp...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Assign Ramp
                </>
              )}
            </Button>
          </form>
        )}

        {/* Ramp Status Overview */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Ramp Status
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Ramps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Available</span>
                <Badge variant="outline" className="text-xs">
                  {availableRamps.length}
                </Badge>
              </div>
              {availableRamps.length > 0 && (
                <div className="space-y-1">
                  {availableRamps.slice(0, 3).map((ramp) => (
                    <div key={ramp.id} className="text-xs text-gray-600 flex items-center justify-between">
                      <span>{ramp.name}</span>
                      <span className="text-gray-400">P{ramp.priority}</span>
                    </div>
                  ))}
                  {availableRamps.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{availableRamps.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Occupied Ramps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Occupied</span>
                <Badge variant="outline" className="text-xs">
                  {occupiedRamps.length}
                </Badge>
              </div>
              {occupiedRamps.length > 0 && (
                <div className="space-y-1">
                  {occupiedRamps.slice(0, 3).map((ramp) => (
                    <div key={ramp.id} className="text-xs text-gray-600 flex items-center justify-between">
                      <span>{ramp.name}</span>
                      <span className="text-gray-400">
                        {ramp.current_booking_id ? 'In Use' : 'Reserved'}
                      </span>
                    </div>
                  ))}
                  {occupiedRamps.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{occupiedRamps.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Maintenance Ramps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
                <Badge variant="outline" className="text-xs">
                  {maintenanceRamps.length}
                </Badge>
              </div>
              {maintenanceRamps.length > 0 && (
                <div className="space-y-1">
                  {maintenanceRamps.slice(0, 3).map((ramp) => (
                    <div key={ramp.id} className="text-xs text-gray-600">
                      {ramp.name}
                    </div>
                  ))}
                  {maintenanceRamps.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{maintenanceRamps.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Ramp Details */}
        {selectedRamp && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h5 className="font-medium text-gray-900 mb-2">Selected Ramp Details</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Location: {selectedRamp.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Priority: {selectedRamp.priority}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  selectedRamp.status === 'available' ? 'bg-green-500' :
                  selectedRamp.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                )} />
                <span>Status: {statusConfig[selectedRamp.status].label}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}