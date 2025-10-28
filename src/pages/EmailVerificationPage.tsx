import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  ArrowRight, 
  RefreshCw,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResendVerificationModal } from '@/components/auth/ResendVerificationModal';
import { authApi } from '@/lib/api';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [showResendModal, setShowResendModal] = useState(false);
  const token = searchParams.get('token');

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      setStatus('success');
      toast.success('Email verified successfully!');
    },
    onError: (error: Error) => {
      setStatus('error');
      toast.error(error.message || 'Email verification failed');
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('error');
    }
  }, [token]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleResendEmail = () => {
    setShowResendModal(true);
  };

  const handleResendSuccess = () => {
    setStatus('loading');
    toast.info('Please check your email for the verification link');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 bg-coral-100 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="h-8 w-8 text-coral-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark">Verifying Your Email</h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark">Email Verified Successfully!</h2>
              <p className="text-gray-600">
                Your email address has been verified. You can now access your dashboard.
              </p>
            </div>
            <Button
              onClick={handleGoToDashboard}
              className="btn-primary w-full sm:w-auto"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-dark">Verification Failed</h2>
              <p className="text-gray-600">
                The verification link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend Verification Email
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="btn-primary w-full sm:w-auto"
              >
                Back to Login
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-logo">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="auth-title">Email Verification</h1>
          <p className="auth-subtitle">
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Your email has been verified successfully'}
            {status === 'error' && 'Email verification failed'}
          </p>
        </div>

        <div className="py-6">
          {renderContent()}
        </div>

        <div className="auth-footer">
          <p>
            Need help?{' '}
            <a href="/support" className="auth-link">
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <ResendVerificationModal
        isOpen={showResendModal}
        onClose={() => setShowResendModal(false)}
        onSuccess={handleResendSuccess}
      />
    </div>
  );
}
