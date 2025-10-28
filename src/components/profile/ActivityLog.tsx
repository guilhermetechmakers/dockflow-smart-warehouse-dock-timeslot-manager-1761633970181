import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, User, Shield, Key, Bell, RefreshCw } from 'lucide-react';
import { useActivityLogs } from '@/hooks/useProfile';

export function ActivityLog() {
  const [page, setPage] = useState(1);
  const { data: activityData, isLoading, error } = useActivityLogs(page, 20);

  const getActivityIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />;
      case 'password_change':
      case '2fa_enable':
      case '2fa_disable':
        return <Shield className="h-4 w-4" />;
      case 'api_key_create':
      case 'api_key_revoke':
        return <Key className="h-4 w-4" />;
      case 'notification_update':
        return <Bell className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'login':
        return 'text-green-600';
      case 'logout':
        return 'text-gray-600';
      case 'password_change':
      case '2fa_enable':
        return 'text-blue-600';
      case 'api_key_create':
        return 'text-purple-600';
      case 'api_key_revoke':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card className="dockflow-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dockflow-card">
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Activity</h3>
          <p className="text-gray-600 mb-4">Unable to load your activity log. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activities = activityData?.activities || [];
  const totalPages = activityData?.totalPages || 1;

  return (
    <Card className="dockflow-card dockflow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-coral-500" />
            <CardTitle>Activity Log</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {activities.length} activities
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg bg-gray-100 ${getActivityColor(activity.action_type)}`}>
                  {getActivityIcon(activity.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(activity.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.action_type.replace(/_/g, ' ')}
                    </Badge>
                    {activity.ip_address && (
                      <span className="text-xs text-gray-500">
                        IP: {activity.ip_address}
                      </span>
                    )}
                  </div>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-900">View Details</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn-outline"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="btn-outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-600">
              Your account activity will appear here as you use DockFlow.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
