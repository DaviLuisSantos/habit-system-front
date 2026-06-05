'use client';

import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePrompt({ open, onOpenChange }: UpgradePromptProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onOpenChange(false);
    router.push('/settings');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 pb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-500" />
            </div>
            <DialogTitle>Limite do plano Free</DialogTitle>
          </div>
          <DialogDescription>
            Você atingiu o limite de <strong>5 hábitos ativos</strong> do plano Free.
            Faça upgrade para o <strong>Arco Pro</strong> e tenha hábitos ilimitados.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3">
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Hábitos ilimitados
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Todos os recursos disponíveis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Suporte prioritário
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={handleUpgrade}
          >
            <Crown className="h-4 w-4 mr-1" />
            Ver planos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
