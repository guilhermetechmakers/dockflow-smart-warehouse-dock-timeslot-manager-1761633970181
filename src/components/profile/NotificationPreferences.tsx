import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Settings } from 'lucide-react';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useProfile';
import { notificationPreferencesSchema, type NotificationPreferencesInput } from '@/lib/validations';

interface NotificationPreferencesProps {
  user: any;
}

export function NotificationPreferences({}: NotificationPreferencesProps) {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      email: preferences?.email || true,
      sms: preferences?.sms || false,
      push: preferences?.push || true,
      email_types: {
        booking_confirmations: preferences?.email_types?.booking_confirmations || true,
        schedule_changes: preferences?.email_types?.schedule_changes || true,
        system_alerts: preferences?.email_types?.system_alerts || true,
        weekly_reports: preferences?.email_types?.weekly_reports || false,
      },
      sms_types: {
        urgent_alerts: preferences?.sms_types?.urgent_alerts || true,
        gate_notifications: preferences?.sms_types?.gate_notifications || false,
      },
    },
  });

  const onSubmit = async (data: NotificationPreferencesInput) => {
    try {
      await updatePreferences.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleToggle = (field: string, value: boolean) => {
    setValue(field as any, value);
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

  return (
    <Card className="dockflow-card dockflow-card-hover">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-coral-500" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Notification Types */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Notification Channels</h4>
            
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-coral-500" />
                <div>
                  <h5 className="font-medium text-gray-900">Email Notifications</h5>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={watch('email')}
                onCheckedChange={(value) => handleToggle('email', value)}
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-coral-500" />
                <div>
                  <h5 className="font-medium text-gray-900">SMS Notifications</h5>
                  <p className="text-sm text-gray-600">Receive notifications via text message</p>
                </div>
              </div>
              <Switch
                checked={watch('sms')}
                onCheckedChange={(value) => handleToggle('sms', value)}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-coral-500" />
                <div>
                  <h5 className="font-medium text-gray-900">Push Notifications</h5>
                  <p className="text-sm text-gray-600">Receive notifications in the app</p>
                </div>
              </div>
              <Switch
                checked={watch('push')}
                onCheckedChange={(value) => handleToggle('push', value)}
              />
            </div>
          </div>

          <Separator />

          {/* Email Types */}
          {watch('email') && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Email Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="booking_confirmations" className="text-sm font-medium">
                    Booking Confirmations
                  </Label>
                  <Switch
                    checked={watch('email_types.booking_confirmations')}
                    onCheckedChange={(value) => handleToggle('email_types.booking_confirmations', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="schedule_changes" className="text-sm font-medium">
                    Schedule Changes
                  </Label>
                  <Switch
                    checked={watch('email_types.schedule_changes')}
                    onCheckedChange={(value) => handleToggle('email_types.schedule_changes', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system_alerts" className="text-sm font-medium">
                    System Alerts
                  </Label>
                  <Switch
                    checked={watch('email_types.system_alerts')}
                    onCheckedChange={(value) => handleToggle('email_types.system_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly_reports" className="text-sm font-medium">
                    Weekly Reports
                  </Label>
                  <Switch
                    checked={watch('email_types.weekly_reports')}
                    onCheckedChange={(value) => handleToggle('email_types.weekly_reports', value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SMS Types */}
          {watch('sms') && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">SMS Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="urgent_alerts" className="text-sm font-medium">
                    Urgent Alerts
                  </Label>
                  <Switch
                    checked={watch('sms_types.urgent_alerts')}
                    onCheckedChange={(value) => handleToggle('sms_types.urgent_alerts', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gate_notifications" className="text-sm font-medium">
                    Gate Notifications
                  </Label>
                  <Switch
                    checked={watch('sms_types.gate_notifications')}
                    onCheckedChange={(value) => handleToggle('sms_types.gate_notifications', value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
