'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/api/auth';
import { useAuth } from '@/lib/contexts/auth-context';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, refreshUser } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resent'>('loading');
  const [resending, setResending] = useState(false);
  const verified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    if (verified.current) return;
    verified.current = true;

    authService.verifyEmail({ token })
      .then(async () => {
        await refreshUser?.();
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [token, refreshUser]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      setStatus('resent');
    } catch {
      // noop
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Verificando...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <div className="text-5xl">✅</div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">E-mail verificado!</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sua conta está confirmada.</p>
        </div>
        <Link href="/dashboard">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Ir para o painel
          </Button>
        </Link>
      </div>
    );
  }

  if (status === 'resent') {
    return (
      <div className="space-y-4 text-center">
        <div className="text-5xl">📬</div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">E-mail reenviado!</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Verifique sua caixa de entrada.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Voltar ao painel</Button>
        </Link>
      </div>
    );
  }

  // status === 'error'
  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl">❌</div>
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">Link inválido ou expirado</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          O link de verificação expirou ou já foi usado.
        </p>
      </div>
      {user && (
        <Button
          onClick={handleResend}
          disabled={resending}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {resending ? 'Reenviando...' : 'Reenviar e-mail de verificação'}
        </Button>
      )}
      <div>
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <VerifyEmailContent />
        </div>
      </div>
    </Suspense>
  );
}
