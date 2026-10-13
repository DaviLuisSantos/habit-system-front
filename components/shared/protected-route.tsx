'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { loginUrlWithNext } from '@/lib/utils/redirect';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, loadError, retry } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !loadError) {
      const { pathname, search } = window.location;
      router.replace(loginUrlWithNext(`${pathname}${search}`));
    }
  }, [isAuthenticated, loading, loadError, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated && loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <WifiOff className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Não foi possível conectar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verifique sua conexão com a internet e tente novamente.
            </p>
          </div>
          <Button onClick={() => retry()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
