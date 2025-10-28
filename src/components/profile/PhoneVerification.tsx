import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useSendPhoneVerification, useVerifyPhone } from '@/hooks/useProfile';
import { phoneVerificationSchema, type PhoneVerificationInput } from '@/lib/validations';

interface PhoneVerificationProps {
  user: any;
}

export function PhoneVerification({ user }: PhoneVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.phone_verified || false);
  
  const sendVerification = useSendPhoneVerification();
  const verifyPhone = useVerifyPhone();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PhoneVerificationInput>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      phone: user?.phone || '',
    },
  });

  const handleSendCode = async (data: PhoneVerificationInput) => {
    try {
      await sendVerification.mutateAsync(data.phone);
      setIsVerifying(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleVerifyCode = async (data: PhoneVerificationInput) => {
    try {
      await verifyPhone.mutateAsync(data);
      setIsVerified(true);
      setIsVerifying(false);
      reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleResendCode = async () => {
    const phone = user?.phone;
    if (phone) {
      try {
        await sendVerification.mutateAsync(phone);
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
            <Phone className="h-5 w-5 text-coral-500" />
            <CardTitle>Phone Verification</CardTitle>
          </div>
          <Badge variant={isVerified ? "default" : "secondary"} className="status-success">
            {isVerified ? (
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
      </CardHeader>
      <CardContent className="space-y-6">
        {!isVerified ? (
          <form onSubmit={handleSubmit(isVerifying ? handleVerifyCode : handleSendCode)} className="space-y-4">
            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="form-label">
                Phone Number
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                disabled={isVerifying}
                className="form-input"
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Verification Code Input */}
            {isVerifying && (
              <div className="space-y-2">
                <Label htmlFor="verification_code" className="form-label">
                  Verification Code
                </Label>
                <Input
                  id="verification_code"
                  {...register('verification_code')}
                  className="form-input"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                {errors.verification_code && (
                  <p className="text-sm text-red-600">{errors.verification_code.message}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Didn't receive the code?</span>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={sendVerification.isPending}
                    className="text-coral-500 hover:text-coral-600 p-0 h-auto"
                  >
                    Resend Code
                  </Button>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || sendVerification.isPending || verifyPhone.isPending}
                className="btn-primary"
              >
                {isSubmitting ? (
                  'Processing...'
                ) : isVerifying ? (
                  'Verify Code'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Phone Verified</h4>
                <p className="text-sm text-green-700">
                  Your phone number {user?.phone} has been verified and can be used for SMS notifications.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Why verify your phone?</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Receive important security alerts via SMS</li>
            <li>Enable SMS-based two-factor authentication</li>
            <li>Get notifications about booking changes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
