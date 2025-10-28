import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  AlertTriangle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportTemplate, PrebuiltReport } from '@/types/analytics';

interface ReportTemplateCardProps {
  template: ReportTemplate | PrebuiltReport;
  onUse: (id: string) => void;
  onPreview?: (id: string) => void;
  className?: string;
}

export function ReportTemplateCard({
  template,
  onUse,
  onPreview,
  className
}: ReportTemplateCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'detention':
        return <Clock className="h-5 w-5" />;
      case 'utilization':
        return <BarChart3 className="h-5 w-5" />;
      case 'sla':
        return <AlertTriangle className="h-5 w-5" />;
      case 'performance':
        return <TrendingUp className="h-5 w-5" />;
      case 'billing':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'detention':
        return 'text-orange-600 bg-orange-100';
      case 'utilization':
        return 'text-blue-600 bg-blue-100';
      case 'sla':
        return 'text-red-600 bg-red-100';
      case 'performance':
        return 'text-green-600 bg-green-100';
      case 'billing':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatLastUsed = (lastUsed?: string) => {
    if (!lastUsed) return 'Never used';
    const date = new Date(lastUsed);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Used today';
    if (diffInDays === 1) return 'Used yesterday';
    if (diffInDays < 7) return `Used ${diffInDays} days ago`;
    if (diffInDays < 30) return `Used ${Math.floor(diffInDays / 7)} weeks ago`;
    return `Used ${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <Card className={cn('dockflow-card dockflow-card-hover group cursor-pointer', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              getCategoryColor(template.category)
            )}>
              {getCategoryIcon(template.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg font-semibold text-dark truncate">
                  {template.name}
                </CardTitle>
                {'is_featured' in template && template.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {template.description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={cn('text-xs', getCategoryColor(template.category))}>
              {template.category}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <BarChart3 className="h-3 w-3" />
              <span>{'metrics_count' in template ? template.metrics_count : 0} metrics</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatLastUsed('last_used' in template ? template.last_used : undefined)}</span>
            <div className="flex items-center space-x-3">
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(template.id);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Preview
                </Button>
              )}
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUse(template.id);
                }}
                className="h-7 px-3 text-xs"
              >
                Use Template
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}