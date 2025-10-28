import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SSOButtonsProps {
  onSSOSuccess?: (provider: string) => void;
}

export function SSOButtons({ onSSOSuccess }: SSOButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSSO = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      // TODO: Implement actual SSO logic
      console.log(`SSO login with ${provider}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSSOSuccess?.(provider);
    } catch (error) {
      console.error(`SSO login failed for ${provider}:`, error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const ssoProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      className: 'btn-sso-google',
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#f25022" d="M1 1h10v10H1z" />
          <path fill="#00a4ef" d="M13 1h10v10H13z" />
          <path fill="#7fba00" d="M1 13h10v10H1z" />
          <path fill="#ffb900" d="M13 13h10v10H13z" />
        </svg>
      ),
      className: 'btn-sso-microsoft',
    },
    {
      id: 'okta',
      name: 'Okta',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
      ),
      className: 'btn-sso-okta',
    },
  ];

  return (
    <div className="space-y-3">
      {ssoProviders.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className={provider.className}
          onClick={() => handleSSO(provider.id)}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            provider.icon
          )}
          <span>
            {loadingProvider === provider.id
              ? 'Connecting...'
              : `Continue with ${provider.name}`}
          </span>
        </Button>
      ))}
    </div>
  );
}