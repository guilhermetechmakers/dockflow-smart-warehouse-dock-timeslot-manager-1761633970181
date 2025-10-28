import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Bell, 
  ExternalLink,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import type { ActivityNotification } from '@/types/dashboard';

interface ActivityFeedProps {
  notifications: ActivityNotification[];
  onNotificationClick?: (notification: ActivityNotification) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

const getNotificationIcon = (type: ActivityNotification['type']) => {
  switch (type) {
    case 'arrival':
      return <Truck className="h-4 w-4" />;
    case 'delay':
      return <Clock className="h-4 w-4" />;
    case 'completion':
      return <CheckCircle className="h-4 w-4" />;
    case 'conflict':
      return <AlertTriangle className="h-4 w-4" />;
    case 'system':
      return <Bell className="h-4 w-4" />;
    case 'alert':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: ActivityNotification['type'], priority: ActivityNotification['priority']) => {
  if (priority === 'urgent') {
    return 'text-red-500 bg-red-50 border-red-200';
  }
  
  switch (type) {
    case 'arrival':
      return 'text-green-500 bg-green-50 border-green-200';
    case 'delay':
      return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    case 'completion':
      return 'text-blue-500 bg-blue-50 border-blue-200';
    case 'conflict':
      return 'text-red-500 bg-red-50 border-red-200';
    case 'system':
      return 'text-gray-500 bg-gray-50 border-gray-200';
    case 'alert':
      return 'text-orange-500 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-500 bg-gray-50 border-gray-200';
  }
};

const getPriorityBadge = (priority: ActivityNotification['priority']) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive" className="text-xs">URGENT</Badge>;
    case 'high':
      return <Badge variant="outline" className="text-xs border-red-300 text-red-600">HIGH</Badge>;
    case 'medium':
      return <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600">MED</Badge>;
    case 'low':
    default:
      return null;
  }
};

const formatNotificationTime = (timestamp: string) => {
  try {
    const date = parseISO(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    
    return format(date, 'MMM dd');
  } catch {
    return timestamp;
  }
};

export function ActivityFeed({
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  className
}: ActivityFeedProps) {
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const hasUnread = unreadCount > 0;

  return (
    <Card className={cn('dockflow-card', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-dark">
            Activity Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasUnread && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} unread
              </Badge>
            )}
            {onMarkAllAsRead && hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400">Activity will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm',
                    'hover:bg-gray-50',
                    !notification.is_read && 'bg-blue-50 border-blue-200',
                    notification.action_required && 'ring-2 ring-coral-200'
                  )}
                  onClick={() => onNotificationClick?.(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg border flex-shrink-0',
                      getNotificationColor(notification.type, notification.priority)
                    )}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-dark truncate">
                              {notification.title}
                            </h4>
                            {getPriorityBadge(notification.priority)}
                            {notification.action_required && (
                              <Badge variant="outline" className="text-xs border-coral-300 text-coral-600">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-coral-500 rounded-full" />
                          )}
                          {notification.action_required && (
                            <ExternalLink className="h-3 w-3 text-coral-500" />
                          )}
                        </div>
                      </div>
                      
                      {notification.metadata && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {notification.related_booking_id && (
                            <Badge variant="outline" className="text-xs">
                              Booking: {notification.related_booking_id.slice(-8)}
                            </Badge>
                          )}
                          {notification.related_dock_id && (
                            <Badge variant="outline" className="text-xs">
                              Dock: {notification.related_dock_id}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}