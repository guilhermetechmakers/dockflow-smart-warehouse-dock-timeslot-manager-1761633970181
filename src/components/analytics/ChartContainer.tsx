import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ChartConfig } from '@/types/analytics';

interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  config: ChartConfig;
  isLoading?: boolean;
  error?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartContainer({ 
  title, 
  subtitle, 
  config, 
  isLoading = false, 
  error, 
  className,
  actions 
}: ChartContainerProps) {
  if (isLoading) {
    return (
      <Card className={cn('dockflow-card', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              {subtitle && <Skeleton className="h-4 w-32" />}
            </div>
            {actions && <div className="flex space-x-2">{actions}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('dockflow-card', className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
            {actions && <div className="flex space-x-2">{actions}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Error loading chart</h3>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {/* Chart will be rendered here by the specific chart component */}
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            Chart placeholder - {config.type} chart
          </div>
        </div>
      </CardContent>
    </Card>
  );
}