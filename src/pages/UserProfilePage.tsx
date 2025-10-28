import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Shield, 
  Key, 
  Bell, 
  Activity, 
  Phone, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { ProfileDetailsForm } from '@/components/profile/ProfileDetailsForm';
import { PasswordChangeDialog } from '@/components/profile/PasswordChangeDialog';
import { TwoFactorSetup } from '@/components/profile/TwoFactorSetup';
import { ApiKeysManagement } from '@/components/profile/ApiKeysManagement';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';
import { ActivityLog } from '@/components/profile/ActivityLog';
import { PhoneVerification } from '@/components/profile/PhoneVerification';

export function UserProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="dockflow-card">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-4">Unable to load your profile information. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = profile?.user || profile;
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">User Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={user?.is_verified ? "default" : "secondary"} className="status-success">
            {user?.is_verified ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Unverified
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="dockflow-card dockflow-card-hover">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-coral-100 text-coral-600 text-xl font-semibold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark">{user?.full_name || 'User'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="h-4 w-4 mr-1" />
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
                {user?.phone && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 mr-1" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Login</div>
              <div className="text-sm font-medium">
                {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          {isAdminOrManager && (
            <TabsTrigger value="api-keys" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileDetailsForm user={user} />
          <PhoneVerification user={user} />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <PasswordChangeDialog />
          <TwoFactorSetup user={user} />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationPreferences user={user} />
        </TabsContent>

        {/* API Keys Tab (Admin/Manager only) */}
        {isAdminOrManager && (
          <TabsContent value="api-keys" className="space-y-6">
            <ApiKeysManagement />
          </TabsContent>
        )}

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
