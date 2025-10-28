import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle, 
  X, 
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import type { ScheduleConflict } from '@/types/schedule';

interface ConflictResolutionAssistantProps {
  conflicts: ScheduleConflict[];
  onResolveConflict: (conflictId: string, resolutionId: string) => void;
  onDismissConflict: (conflictId: string) => void;
  onViewBooking: (bookingId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ConflictResolutionAssistant({
  conflicts,
  onResolveConflict,
  onDismissConflict,
  onViewBooking,
  isLoading = false,
  className,
}: ConflictResolutionAssistantProps) {
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, string>>({});

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'overlap':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'capacity_exceeded':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'rule_violation':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConflictColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getResolutionIcon = (type: string) => {
    switch (type) {
      case 'reschedule':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'reassign_dock':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'split_booking':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'extend_capacity':
        return <CheckCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleResolutionSelect = (conflictId: string, resolutionId: string) => {
    setSelectedResolutions(prev => ({
      ...prev,
      [conflictId]: resolutionId
    }));
  };

  const handleResolve = (conflictId: string) => {
    const resolutionId = selectedResolutions[conflictId];
    if (resolutionId) {
      onResolveConflict(conflictId, resolutionId);
      setSelectedResolutions(prev => {
        const newState = { ...prev };
        delete newState[conflictId];
        return newState;
      });
    }
  };

  if (conflicts.length === 0) {
    return (
      <Card className="dockflow-card">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark mb-2">No Conflicts Found</h3>
          <p className="text-gray-600">Your schedule is conflict-free! All bookings are properly scheduled.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-coral-500" />
          Conflict Resolution Assistant
        </h3>
        <Badge variant="outline" className="text-coral-500 border-coral-500">
          {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {conflicts.map(conflict => (
          <Card 
            key={conflict.id} 
            className={cn(
              "dockflow-card border-l-4",
              getConflictColor(conflict.severity)
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getConflictIcon(conflict.type)}
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {conflict.message}
                      {getSeverityBadge(conflict.severity)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Affects {conflict.affected_bookings.length} booking{conflict.affected_bookings.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismissConflict(conflict.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Affected Bookings */}
              <div>
                <h4 className="text-sm font-medium text-dark mb-2">Affected Bookings</h4>
                <div className="flex flex-wrap gap-2">
                  {conflict.affected_bookings.map(bookingId => (
                    <Button
                      key={bookingId}
                      variant="outline"
                      size="sm"
                      onClick={() => onViewBooking(bookingId)}
                      className="text-xs"
                    >
                      <Truck className="h-3 w-3 mr-1" />
                      {bookingId.slice(-8)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Suggested Resolutions */}
              {conflict.suggested_resolutions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-dark mb-3">Suggested Resolutions</h4>
                  <div className="space-y-3">
                    {conflict.suggested_resolutions.map(resolution => (
                      <div
                        key={resolution.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all duration-200",
                          selectedResolutions[conflict.id] === resolution.id
                            ? "border-coral-500 bg-coral-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                        onClick={() => handleResolutionSelect(conflict.id, resolution.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getResolutionIcon(resolution.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-dark capitalize">
                                  {resolution.type.replace('_', ' ')}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getImpactColor(resolution.impact))}
                                >
                                  {resolution.impact} impact
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {resolution.description}
                              </p>
                              {resolution.estimated_delay_minutes && (
                                <div className="flex items-center gap-1 text-xs text-orange-600">
                                  <Clock className="h-3 w-3" />
                                  Estimated delay: {resolution.estimated_delay_minutes} minutes
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {selectedResolutions[conflict.id] === resolution.id ? (
                              <CheckCircle className="h-5 w-5 text-coral-500" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDismissConflict(conflict.id)}
                >
                  Dismiss
                </Button>
                {selectedResolutions[conflict.id] && (
                  <Button
                    size="sm"
                    onClick={() => handleResolve(conflict.id)}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Resolving...' : 'Apply Resolution'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="dockflow-card bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} require{conflicts.length === 1 ? 's' : ''} attention
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                High: {conflicts.filter(c => c.severity === 'high').length}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Medium: {conflicts.filter(c => c.severity === 'medium').length}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Low: {conflicts.filter(c => c.severity === 'low').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}