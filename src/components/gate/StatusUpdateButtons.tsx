import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  CheckSquare, 
  XCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GateStatus } from '@/types/gate';

interface StatusUpdateButtonsProps {
  currentStatus: GateStatus;
  onStatusUpdate: (status: GateStatus) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const statusButtons: Array<{
  status: GateStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  description: string;
  allowedTransitions: GateStatus[];
}> = [
  {
    status: 'arrived',
    label: 'Arrived',
    icon: CheckCircle2,
    variant: 'default',
    description: 'Vehicle has arrived at the gate',
    allowedTransitions: ['waiting', 'cancelled'],
  },
  {
    status: 'waiting',
    label: 'Waiting',
    icon: Clock,
    variant: 'outline',
    description: 'Vehicle is waiting for ramp assignment',
    allowedTransitions: ['in_progress', 'cancelled'],
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    icon: Play,
    variant: 'default',
    description: 'Loading/unloading is in progress',
    allowedTransitions: ['completed', 'cancelled'],
  },
  {
    status: 'completed',
    label: 'Completed',
    icon: CheckSquare,
    variant: 'default',
    description: 'Visit has been completed',
    allowedTransitions: [],
  },
  {
    status: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    variant: 'destructive',
    description: 'Visit has been cancelled',
    allowedTransitions: [],
  },
];

export function StatusUpdateButtons({ 
  currentStatus, 
  onStatusUpdate, 
  disabled = false,
  className 
}: StatusUpdateButtonsProps) {
  const [isUpdating, setIsUpdating] = useState<GateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentStatusConfig = statusButtons.find(s => s.status === currentStatus);
  const availableTransitions = currentStatusConfig?.allowedTransitions || [];

  const handleStatusUpdate = async (status: GateStatus) => {
    try {
      setIsUpdating(status);
      setError(null);
      await onStatusUpdate(status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
    } finally {
      setIsUpdating(null);
    }
  };

  const getButtonVariant = (status: GateStatus) => {
    const config = statusButtons.find(s => s.status === status);
    return config?.variant || 'outline';
  };

  const isButtonDisabled = (status: GateStatus) => {
    return disabled || 
           isUpdating !== null || 
           status === currentStatus || 
           !availableTransitions.includes(status);
  };

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Status Update
        </CardTitle>
        {currentStatusConfig && (
          <p className="text-sm text-gray-600">
            Current status: <span className="font-medium">{currentStatusConfig.label}</span>
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {statusButtons.map(({ status, label, icon: Icon, description }) => {
            const isCurrentStatus = status === currentStatus;
            const isUpdatingThis = isUpdating === status;
            const isDisabled = isButtonDisabled(status);
            
            return (
              <Button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={isDisabled}
                variant={isCurrentStatus ? 'secondary' : getButtonVariant(status)}
                className={cn(
                  'h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200',
                  'hover:scale-105 hover:shadow-md',
                  isCurrentStatus && 'ring-2 ring-coral-500 bg-coral-50 text-coral-700',
                  isDisabled && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none',
                  !isDisabled && 'hover:scale-105'
                )}
              >
                {isUpdatingThis ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Icon className={cn(
                    'h-6 w-6',
                    isCurrentStatus ? 'text-coral-600' : 'text-current'
                  )} />
                )}
                
                <div className="text-center">
                  <div className="font-medium text-sm">
                    {isUpdatingThis ? 'Updating...' : label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Status Flow Indicator */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Status Flow
          </h4>
          <div className="flex items-center justify-between">
            {statusButtons
              .filter(s => s.status !== 'cancelled')
              .map(({ status, label }, index, array) => {
                const isActive = status === currentStatus;
                const isCompleted = ['arrived', 'waiting', 'in_progress', 'completed']
                  .indexOf(status) <= ['arrived', 'waiting', 'in_progress', 'completed']
                  .indexOf(currentStatus);
                
                return (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200',
                        isActive ? 'bg-coral-500 text-white scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-gray-200 text-gray-500'
                      )}>
                        {isCompleted && !isActive ? '✓' : index + 1}
                      </div>
                      <span className={cn(
                        'text-xs mt-1 text-center',
                        isActive ? 'text-coral-600 font-medium' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-500'
                      )}>
                        {label}
                      </span>
                    </div>
                    {index < array.length - 1 && (
                      <div className={cn(
                        'flex-1 h-0.5 mx-2 transition-colors duration-200',
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
          </div>
        </div>

        {/* Quick Actions */}
        {currentStatus === 'waiting' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Next:</strong> Assign a ramp to move to "In Progress" status
            </p>
          </div>
        )}
        
        {currentStatus === 'in_progress' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next:</strong> Mark as "Completed" when loading/unloading is finished
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}