import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardKPI } from '@/types/dashboard';

interface KPICardProps {
  kpi: DashboardKPI;
  className?: string;
}

const formatValue = (value: number | string, format: DashboardKPI['format']): string => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'percentage':
      return `${value}%`;
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'time':
      return `${value}m`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

const getTrendIcon = (trend: DashboardKPI['trend']) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4" />;
    case 'down':
      return <TrendingDown className="h-4 w-4" />;
    case 'stable':
    default:
      return <Minus className="h-4 w-4" />;
  }
};

const getChangeIcon = (changeType: DashboardKPI['changeType']) => {
  switch (changeType) {
    case 'increase':
      return <ArrowUp className="h-3 w-3" />;
    case 'decrease':
      return <ArrowDown className="h-3 w-3" />;
    case 'neutral':
    default:
      return null;
  }
};

const getColorClasses = (color: DashboardKPI['color']) => {
  switch (color) {
    case 'coral':
      return {
        icon: 'text-coral-500',
        change: 'text-coral-600',
        bg: 'bg-coral-50',
        border: 'border-coral-200',
      };
    case 'green':
      return {
        icon: 'text-green-500',
        change: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    case 'yellow':
      return {
        icon: 'text-yellow-500',
        change: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
      };
    case 'blue':
      return {
        icon: 'text-blue-500',
        change: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      };
    case 'gray':
    default:
      return {
        icon: 'text-gray-500',
        change: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
      };
  }
};

export function KPICard({ kpi, className }: KPICardProps) {
  const colorClasses = getColorClasses(kpi.color);
  const changeValue = Math.abs(kpi.change);
  const isPositive = kpi.changeType === 'increase';
  const isNeutral = kpi.changeType === 'neutral';

  return (
    <Card className={cn(
      'dockflow-card dockflow-card-hover p-6 transition-all duration-200',
      colorClasses.border,
      className
    )}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                'p-2 rounded-xl',
                colorClasses.bg
              )}>
                <div className={cn('h-5 w-5', colorClasses.icon)}>
                  {/* Icon will be rendered based on kpi.icon string */}
                  {kpi.icon === 'truck' && <TrendingUp className="h-5 w-5" />}
                  {kpi.icon === 'clock' && <TrendingUp className="h-5 w-5" />}
                  {kpi.icon === 'check-circle' && <TrendingUp className="h-5 w-5" />}
                  {kpi.icon === 'alert-triangle' && <TrendingUp className="h-5 w-5" />}
                  {kpi.icon === 'bar-chart' && <TrendingUp className="h-5 w-5" />}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(kpi.trend)}
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-1">
              {kpi.title}
            </h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-dark">
                {formatValue(kpi.value, kpi.format)}
              </span>
              
              {!isNeutral && (
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}>
                  {getChangeIcon(kpi.changeType)}
                  <span>{changeValue}%</span>
                </div>
              )}
            </div>
            
            {kpi.description && (
              <p className="text-sm text-gray-500 mt-2">
                {kpi.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}