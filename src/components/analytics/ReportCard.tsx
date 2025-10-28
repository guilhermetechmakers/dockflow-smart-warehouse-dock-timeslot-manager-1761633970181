import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Star, 
  StarOff, 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SavedReport } from '@/types/analytics';

interface ReportCardProps {
  report: SavedReport;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onExport: (id: string) => void;
  onShare: (id: string) => void;
  className?: string;
}

export function ReportCard({
  report,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onExport,
  onShare,
  className
}: ReportCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prebuilt':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn('dockflow-card dockflow-card-hover group', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg font-semibold text-dark truncate">
                {report.name}
              </CardTitle>
              <Badge className={cn('text-xs', getTypeColor(report.type))}>
                {report.type}
              </Badge>
            </div>
            {report.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {report.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(report.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{report.created_by}</span>
              </div>
              {report.last_generated && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Generated {formatDate(report.last_generated)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(report.id)}
              className="h-8 w-8 p-0"
            >
              {report.is_favorite ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView(report.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Report
                </DropdownMenuItem>
                {report.type === 'custom' && (
                  <DropdownMenuItem onClick={() => onEdit(report.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Report
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onExport(report.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(report.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(report.id)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.type === 'custom' && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(report.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {report.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {report.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{report.tags.length - 3} more
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{report.generation_count} generations</span>
            {report.shared_with.length > 0 && (
              <span>{report.shared_with.length} shared</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}