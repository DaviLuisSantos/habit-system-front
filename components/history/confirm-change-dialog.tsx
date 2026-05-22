'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckInStatus } from '@/lib/types/checkin';

const STATUS_LABELS: Record<CheckInStatus, string> = {
  [CheckInStatus.Done]:    'Feito ✅',
  [CheckInStatus.Partial]: 'Parcial ⚡',
  [CheckInStatus.Skipped]: 'Pulado ⏭️',
};

interface ConfirmChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  fromStatus: CheckInStatus;
  toStatus: CheckInStatus;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmChangeDialog({
  open,
  onOpenChange,
  habitName,
  fromStatus,
  toStatus,
  onConfirm,
  isLoading,
}: ConfirmChangeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Alterar check-in?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{habitName}</span>
            <br />
            <span className="text-muted-foreground">
              {STATUS_LABELS[fromStatus]}{' '}
              <span className="text-foreground font-medium">→</span>{' '}
              {STATUS_LABELS[toStatus]}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Salvando…' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
