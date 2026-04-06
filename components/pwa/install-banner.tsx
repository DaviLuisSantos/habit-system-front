'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    Promise.resolve().then(() => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      const iosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

      setIsInstalled(standalone || iosStandalone);
      setIsIos(iosDevice && !standalone && !iosStandalone);

      if (iosDevice && !standalone && !iosStandalone) {
        setIsVisible(true);
      }
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const message = useMemo(() => {
    if (isInstalled) return '';
    if (isIos) {
      return 'No iPhone, toque em Compartilhar e depois em Adicionar à Tela de Início.';
    }
    return 'Instale o app no celular para abrir mais rápido e usar como atalho.';
  }, [isIos, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div
      className={cn(
        'fixed left-4 right-4 z-[60] md:left-auto md:right-6 md:max-w-sm',
        'bottom-20 md:bottom-6'
      )}
    >
      <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-sm font-medium text-foreground">Habit System no celular</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <div className="mt-3 flex gap-2">
          {deferredPrompt && (
            <Button size="sm" onClick={handleInstall} className="flex-1">
              Instalar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(false)}
            className={cn(!deferredPrompt && 'flex-1')}
          >
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
}