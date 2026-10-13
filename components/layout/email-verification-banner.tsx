'use client';

import { useState } from 'react';
import { MailWarning, X } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { authService } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/toast';

const DISMISS_KEY = 'arco:email-banner-dismissed';

function readDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Aviso não bloqueante para confirmar o e-mail. Some ao dispensar (até a próxima sessão). */
export function EmailVerificationBanner() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [dismissed, setDismissed] = useState(() => typeof window !== 'undefined' && readDismissed());
  const [sending, setSending] = useState(false);

  if (!user || user.isEmailVerified || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  };

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.resendVerification();
      addToast({
        type: 'success',
        title: 'E-mail enviado',
        description: `Enviamos um novo link para ${user.email}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Não foi possível reenviar',
        description: getErrorMessage(err),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="status"
      className="mb-4 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm"
    >
      <MailWarning className="h-4 w-4 shrink-0 text-warning" />
      <p className="flex-1 text-foreground">
        Confirme seu e-mail para proteger sua conta.{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="font-medium text-primary underline underline-offset-2 hover:no-underline disabled:opacity-50 cursor-pointer"
        >
          {sending ? 'Enviando...' : 'Reenviar'}
        </button>
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dispensar aviso"
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
