import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { 
  passwordResetRequestSchema, 
  passwordResetConfirmSchema,
  type PasswordResetRequestInput,
  type PasswordResetConfirmInput 
} from '@/lib/validations';
import { usePasswordReset, useConfirmPasswordReset } from '@/hooks/useAuth';

type ResetStep = 'request' | 'confirm' | 'success';

export function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<ResetStep>('request');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  
  const passwordResetMutation = usePasswordReset();
  const confirmPasswordResetMutation = useConfirmPasswordReset();

  // Check if token is provided in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStep('confirm');
    }
  }, [searchParams]);

  // Request Reset Form
  const requestForm = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onRequestSubmit = async (data: PasswordResetRequestInput) => {
    try {
      await passwordResetMutation.mutateAsync(data.email);
      setEmail(data.email);
      setStep('confirm');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  // Confirm Reset Form
  const confirmForm = useForm<PasswordResetConfirmInput>({
    resolver: zodResolver(passwordResetConfirmSchema),
    defaultValues: {
      token: searchParams.get('token') || '',
    },
  });

  const onConfirmSubmit = async (data: PasswordResetConfirmInput) => {
    try {
      await confirmPasswordResetMutation.mutateAsync({
        token: data.token,
        password: data.password,
      });
      setStep('success');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    if (email) {
      passwordResetMutation.mutate(email);
    }
  };

  return (
    <div className="auth-container">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="auth-title">
            {step === 'request' && 'Reset Password'}
            {step === 'confirm' && 'Set New Password'}
            {step === 'success' && 'Password Reset Complete'}
          </h1>
          <p className="auth-subtitle">
            {step === 'request' && 'Enter your email address and we\'ll send you a reset link'}
            {step === 'confirm' && 'Create a new password for your account'}
            {step === 'success' && 'Your password has been successfully reset'}
          </p>
        </div>

        {/* Request Reset Step */}
        {step === 'request' && (
          <Card className="auth-card animate-fade-in">
            <CardContent className="space-y-6">
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="form-label">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="form-input"
                    {...requestForm.register('email')}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={requestForm.formState.isSubmitting}
                >
                  {requestForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send reset link
                    </>
                  )}
                </Button>
              </form>

              <div className="auth-divider">
                <div className="auth-divider-text">or</div>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="auth-link inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirm Reset Step */}
        {step === 'confirm' && (
          <Card className="auth-card animate-fade-in">
            <CardContent className="space-y-6">
              <form onSubmit={confirmForm.handleSubmit(onConfirmSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="token" className="form-label">
                    Reset token
                  </Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Enter reset token from email"
                    className="form-input"
                    {...confirmForm.register('token')}
                  />
                  {confirmForm.formState.errors.token && (
                    <p className="mt-1 text-sm text-red-600">
                      {confirmForm.formState.errors.token.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="form-label">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter your new password"
                      className="form-input pr-10"
                      {...confirmForm.register('password')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {confirmForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {confirmForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="form-label">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm your new password"
                      className="form-input pr-10"
                      {...confirmForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {confirmForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {confirmForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Password Strength Meter */}
                <PasswordStrengthMeter
                  password={confirmForm.watch('password') || ''}
                  className="mt-4"
                />

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={confirmForm.formState.isSubmitting}
                >
                  {confirmForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </form>

              <div className="auth-divider">
                <div className="auth-divider-text">or</div>
              </div>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  className="auth-link text-sm"
                  disabled={!email}
                >
                  Resend reset email
                </button>
                <div>
                  <Link
                    to="/login"
                    className="auth-link inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Card className="auth-card animate-fade-in">
            <CardContent className="space-y-6 text-center">
              <div className="magic-link-icon">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Password reset successful!
                </h3>
                <p className="text-gray-600">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>

              <Button
                onClick={handleBackToLogin}
                className="w-full btn-primary"
              >
                Continue to sign in
              </Button>

              <div className="auth-footer">
                <Link to="/" className="auth-link">
                  Return to homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Links */}
        <div className="auth-footer text-center space-y-2">
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/privacy" className="auth-link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="auth-link">
              Terms of Service
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}
