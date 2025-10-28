import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Redirect to login page with signup mode
    const redirectUrl = searchParams.toString() 
      ? `/login?mode=signup&${searchParams.toString()}`
      : '/login?mode=signup';
    navigate(redirectUrl, { replace: true });
  }, [navigate, searchParams]);

  return null; // This component only redirects
}
