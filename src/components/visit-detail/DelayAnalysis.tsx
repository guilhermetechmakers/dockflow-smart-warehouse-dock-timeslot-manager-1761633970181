import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import type { DelayAnalysis, CauseCode } from '@/types/visit-detail';

interface DelayAnalysisProps {
  delayAnalysis: DelayAnalysis;
  causeCodes: CauseCode[];
  isLoading?: boolean;
  onUpdateCauseCodes?: (causeCodes: string[]) => void;
  canEdit?: boolean;
}

const getDelayColor = (delayMinutes?: number) => {
  if (!delayMinutes) return 'text-gray-500';
  if (delayMinutes <= 0) return 'text-green-600';
  if (delayMinutes <= 30) return 'text-yellow-600';
  if (delayMinutes <= 60) return 'text-orange-600';
  return 'text-red-600';
};

const getDelayIcon = (delayMinutes?: number) => {
  if (!delayMinutes) return Clock;
  if (delayMinutes <= 0) return CheckCircle;
  if (delayMinutes <= 30) return Info;
  if (delayMinutes <= 60) return AlertTriangle;
  return XCircle;
};

const getDelaySeverity = (delayMinutes?: number): 'none' | 'low' | 'medium' | 'high' | 'critical' => {
  if (!delayMinutes) return 'none';
  if (delayMinutes <= 0) return 'none';
  if (delayMinutes <= 15) return 'low';
  if (delayMinutes <= 30) return 'medium';
  if (delayMinutes <= 60) return 'high';
  return 'critical';
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'none': return 'bg-green-100 text-green-800';
    case 'low': return 'bg-yellow-100 text-yellow-800';
    case 'medium': return 'bg-orange-100 text-orange-800';
    case 'high': return 'bg-red-100 text-red-800';
    case 'critical': return 'bg-red-200 text-red-900';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export function DelayAnalysis({ 
  delayAnalysis, 
  causeCodes, 
  isLoading = false,
  onUpdateCauseCodes,
  canEdit = false 
}: DelayAnalysisProps) {
  if (isLoading) {
    return (
      <Card className="dockflow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-coral-500" />
            Delay Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const delayMinutes = delayAnalysis.delay_minutes || 0;
  const detentionMinutes = delayAnalysis.detention_minutes || 0;
  const variancePercentage = delayAnalysis.variance_percentage || 0;
  const severity = getDelaySeverity(delayMinutes);
  const DelayIcon = getDelayIcon(delayMinutes);

  const suggestedCauseCodes = causeCodes.filter(code => 
    delayAnalysis.suggested_cause_codes?.includes(code.id)
  );

  const handleCauseCodeToggle = (codeId: string) => {
    if (!onUpdateCauseCodes) return;
    
    const currentCodes = delayAnalysis.suggested_cause_codes || [];
    const newCodes = currentCodes.includes(codeId)
      ? currentCodes.filter(id => id !== codeId)
      : [...currentCodes, codeId];
    
    onUpdateCauseCodes(newCodes);
  };

  return (
    <Card className="dockflow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-coral-500" />
          Delay Analysis
          {delayMinutes > 0 && (
            <Badge className={getSeverityColor(severity)}>
              {severity.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DelayIcon className={`h-5 w-5 ${getDelayColor(delayMinutes)}`} />
              <span className="text-sm font-medium text-gray-600">Delay</span>
            </div>
            <div className={`text-2xl font-bold ${getDelayColor(delayMinutes)}`}>
              {formatDuration(Math.abs(delayMinutes))}
            </div>
            {delayMinutes > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {delayMinutes > 0 ? 'behind' : 'ahead of'} schedule
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Detention</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(detentionMinutes)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              total detention time
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              {variancePercentage > 0 ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-600">Variance</span>
            </div>
            <div className={`text-2xl font-bold ${
              variancePercentage > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {Math.abs(variancePercentage).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              from planned duration
            </div>
          </div>
        </div>

        {/* Duration Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Duration Comparison</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Planned Duration</span>
              <span className="font-medium">{formatDuration(delayAnalysis.planned_duration_minutes)}</span>
            </div>
            {delayAnalysis.actual_duration_minutes && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Actual Duration</span>
                <span className="font-medium">{formatDuration(delayAnalysis.actual_duration_minutes)}</span>
              </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-coral-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (delayAnalysis.planned_duration_minutes / Math.max(delayAnalysis.actual_duration_minutes || delayAnalysis.planned_duration_minutes, 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Delay Breakdown */}
        {delayAnalysis.delay_breakdown && delayAnalysis.delay_breakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Delay Breakdown by Phase</h4>
            <div className="space-y-2">
              {delayAnalysis.delay_breakdown.map((breakdown, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-coral-500 rounded-full" />
                    <span className="text-sm font-medium capitalize">{breakdown.phase.replace('_', ' ')}</span>
                    {breakdown.cause && (
                      <Badge variant="outline" className="text-xs">
                        {breakdown.cause}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {breakdown.actual_minutes ? formatDuration(breakdown.actual_minutes) : 'N/A'}
                    </div>
                    {breakdown.delay_minutes && breakdown.delay_minutes > 0 && (
                      <div className="text-xs text-red-600">
                        +{formatDuration(breakdown.delay_minutes)} delay
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Cause Codes */}
        {suggestedCauseCodes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">Suggested Cause Codes</h4>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // This would open a modal to select cause codes
                    console.log('Open cause code selector');
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedCauseCodes.map((code) => (
                <div 
                  key={code.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    canEdit 
                      ? 'hover:bg-gray-50 border-gray-200' 
                      : 'border-gray-100 bg-gray-50'
                  }`}
                  onClick={() => canEdit && handleCauseCodeToggle(code.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{code.code}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getSeverityColor(code.severity)}`}
                        >
                          {code.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{code.description}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        code.category === 'carrier' ? 'border-blue-200 text-blue-700' :
                        code.category === 'warehouse' ? 'border-green-200 text-green-700' :
                        code.category === 'external' ? 'border-orange-200 text-orange-700' :
                        'border-gray-200 text-gray-700'
                      }`}
                    >
                      {code.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No delays message */}
        {delayMinutes <= 0 && !delayAnalysis.delay_breakdown?.length && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No delays detected for this visit</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}