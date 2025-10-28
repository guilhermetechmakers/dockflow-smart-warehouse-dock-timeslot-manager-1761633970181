import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Smartphone, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { useTwoFactorSetup, useEnableTwoFactor, useDisableTwoFactor } from '@/hooks/useProfile';

interface TwoFactorSetupProps {
  user: any;
}

export function TwoFactorSetup({ user }: TwoFactorSetupProps) {
  const [isEnabled, setIsEnabled] = useState(user?.two_factor_enabled || false);
  const [setupMethod, setSetupMethod] = useState<'totp' | 'sms'>('totp');
  
  useTwoFactorSetup();
  const enableTwoFactor = useEnableTwoFactor();
  const disableTwoFactor = useDisableTwoFactor();

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        await enableTwoFactor.mutateAsync({ method: setupMethod, verification_code: '' });
        setIsEnabled(true);
      } catch (error) {
        // Error is handled by the mutation
      }
    } else {
      try {
        await disableTwoFactor.mutateAsync({ method: user?.two_factor_method || 'totp', verification_code: '' });
        setIsEnabled(false);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  return (
    <Card className="dockflow-card dockflow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-coral-500" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"} className="status-success">
            {isEnabled ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Disabled
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-coral-100 rounded-lg">
              <Shield className="h-5 w-5 text-coral-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">2FA Status</h3>
              <p className="text-sm text-gray-600">
                {isEnabled 
                  ? `Two-factor authentication is enabled via ${user?.two_factor_method?.toUpperCase() || 'TOTP'}`
                  : 'Add an extra layer of security to your account'
                }
              </p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={enableTwoFactor.isPending || disableTwoFactor.isPending}
          />
        </div>

        {/* Setup Instructions */}
        {!isEnabled && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Choose your 2FA method:</h4>
            
            {/* TOTP Option */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <QrCode className="h-5 w-5 text-coral-500" />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">Authenticator App (Recommended)</h5>
                  <p className="text-sm text-gray-600">
                    Use apps like Google Authenticator, Authy, or 1Password
                  </p>
                </div>
                <Button
                  variant={setupMethod === 'totp' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSetupMethod('totp')}
                  className={setupMethod === 'totp' ? 'btn-primary' : 'btn-outline'}
                >
                  Select
                </Button>
              </div>
            </div>

            {/* SMS Option */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-coral-500" />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">SMS Text Message</h5>
                  <p className="text-sm text-gray-600">
                    Receive verification codes via text message
                  </p>
                </div>
                <Button
                  variant={setupMethod === 'sms' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSetupMethod('sms')}
                  className={setupMethod === 'sms' ? 'btn-primary' : 'btn-outline'}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Current Status Info */}
        {isEnabled && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">2FA is Active</h4>
                <p className="text-sm text-green-700">
                  Your account is protected with two-factor authentication via {user?.two_factor_method?.toUpperCase() || 'TOTP'}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Security Note:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Keep your backup codes in a safe place</li>
            <li>Don't share your authenticator app with others</li>
            <li>Contact support if you lose access to your 2FA device</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
