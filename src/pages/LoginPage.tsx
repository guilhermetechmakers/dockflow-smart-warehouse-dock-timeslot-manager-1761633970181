import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Warehouse, ArrowLeft, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { SSOButtons } from '@/components/auth/SSOButtons';

type AuthMode = 'login' | 'signup' | 'magic-link';

export function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showMagicLink, setShowMagicLink] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle mode parameter from URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setAuthMode('signup');
    } else if (mode === 'magic-link') {
      setShowMagicLink(true);
    }
  }, [searchParams]);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const handleSSOSuccess = (provider: string) => {
    console.log(`SSO success with ${provider}`);
    navigate('/dashboard');
  };

  const handleMagicLinkSuccess = () => {
    setShowMagicLink(false);
    // Show success message or redirect
  };

  return (
    <div className="auth-container">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="auth-header animate-fade-in-down">
          <div className="auth-logo animate-bounce-in">
            <Warehouse className="h-8 w-8 text-white" />
          </div>
          <h1 className="auth-title animate-fade-in-up">
            {authMode === 'login' && 'Welcome back'}
            {authMode === 'signup' && 'Create your account'}
            {authMode === 'magic-link' && 'Magic Link Login'}
          </h1>
          <p className="auth-subtitle animate-fade-in-up">
            {authMode === 'login' && 'Sign in to your DockFlow account'}
            {authMode === 'signup' && 'Get started with DockFlow today'}
            {authMode === 'magic-link' && 'We\'ll send you a secure login link'}
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="auth-card animate-fade-in-up">
          <CardContent className="space-y-6">
            {showMagicLink ? (
              <div className="space-y-4 animate-fade-in">
                <MagicLinkForm onSuccess={handleMagicLinkSuccess} />
                <Button
                  variant="ghost"
                  onClick={() => setShowMagicLink(false)}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login options
                </Button>
              </div>
            ) : (
              <>
                {/* SSO Buttons */}
                <div className="space-y-4 animate-stagger-1">
                  <SSOButtons onSSOSuccess={handleSSOSuccess} />
                  
                  <div className="auth-divider animate-stagger-2">
                    <span className="auth-divider-text">or continue with email</span>
                  </div>
                </div>

                {/* Auth Forms */}
                <div className="animate-stagger-3">
                  <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value="signup" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4">
                      <LoginForm onSuccess={handleAuthSuccess} />
                      
                      <div className="text-center">
                        <Button
                          variant="link"
                          onClick={() => setShowMagicLink(true)}
                          className="text-sm text-coral-500 hover:text-coral-600"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Use magic link instead
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                      <SignupForm onSuccess={handleAuthSuccess} />
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="auth-footer animate-stagger-4">
          <p>
            By using DockFlow, you agree to our{' '}
            <Link to="/terms" className="auth-link">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="auth-link">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Back to Landing */}
        <div className="text-center animate-stagger-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
