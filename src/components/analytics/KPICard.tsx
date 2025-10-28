import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsKPI } from '@/types/analytics';

interface KPICardProps {
  kpi: AnalyticsKPI;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  const getTrendIcon = () => {
    switch (kpi.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (kpi.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendArrow = () => {
    switch (kpi.trend) {
      case 'up':
        return <ArrowUpRight className="h-3 w-3" />;
      case 'down':
        return <ArrowDownRight className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className={cn('dockflow-card dockflow-card-hover p-6', className)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${kpi.color}20` }}
            >
              <div 
                className="h-6 w-6"
                style={{ color: kpi.color }}
              >
                {/* Icon placeholder - you can replace with actual icon component */}
                <div className="h-full w-full rounded bg-current opacity-60" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-dark">
                  {kpi.value.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">{kpi.unit}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {getTrendIcon()}
            <div className={cn('flex items-center space-x-1 text-sm font-medium', getTrendColor())}>
              {getTrendArrow()}
              <span>{Math.abs(kpi.trend_percentage)}%</span>
            </div>
            <span className="text-xs text-gray-500">{kpi.change_period}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}