'use client';

import { useState } from 'react';
import { Check, Zap, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit, FrequencyType } from '@/lib/types/habit';
import { CheckIn, CheckInStatus } from '@/lib/types/checkin';
import { ConfirmChangeDialog } from './confirm-change-dialog';
import { cn } from '@/lib/utils';

interface HistoryHabitCardProps {
  habit: Habit;
  checkIn?: CheckIn;
  onCreateCheckIn: (status: CheckInStatus) => void;
  onUpdateCheckIn: (id: string, newStatus: CheckInStatus) => void;
  isLoading?: boolean;
}

function getFrequencyLabel(habit: Habit): string {
  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return 'Diário';
    case FrequencyType.SpecificDays: {
      const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      return habit.frequencyDays?.map((d) => labels[d]).join(', ') || '';
    }
    case FrequencyType.XTimesWeek:
      return `${habit.frequencyTimes}x/semana`;
    default:
      return '';
  }
}

function StatusBadge({ status }: { status: CheckInStatus }) {
  if (status === CheckInStatus.Done)    return <Badge variant="success">Feito</Badge>;
  if (status === CheckInStatus.Partial) return <Badge variant="warning">Parcial</Badge>;
  return <Badge variant="secondary">Pulado</Badge>;
}

function cardBorder(checkIn?: CheckIn): string {
  if (!checkIn) return 'border-border';
  switch (checkIn.status) {
    case CheckInStatus.Done:    return 'border-green-500/40 bg-green-500/10';
    case CheckInStatus.Partial: return 'border-yellow-500/40 bg-yellow-500/10';
    case CheckInStatus.Skipped: return 'border-border bg-muted/50';
    default:                    return 'border-border';
  }
}

export function HistoryHabitCard({
  habit,
  checkIn,
  onCreateCheckIn,
  onUpdateCheckIn,
  isLoading,
}: HistoryHabitCardProps) {
  const [pendingStatus, setPendingStatus] = useState<CheckInStatus | null>(null);

  const handleClick = (status: CheckInStatus) => {
    if (checkIn) {
      if (status === checkIn.status) return; // já está neste estado
      setPendingStatus(status);             // abre confirmação
    } else {
      onCreateCheckIn(status);             // sem check-in: cria direto
    }
  };

  const handleConfirm = () => {
    if (pendingStatus && checkIn) {
      onUpdateCheckIn(checkIn.id, pendingStatus);
    }
    setPendingStatus(null);
  };

  const active = checkIn?.status;

  return (
    <>
      <Card className={cn('transition-colors', cardBorder(checkIn))}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
                {checkIn && <StatusBadge status={checkIn.status} />}
              </div>
              {habit.description && (
                <p className="text-sm text-muted-foreground truncate mb-2">
                  {habit.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">Peso:</span>{' '}
                  {habit.weight}
                </span>
                <span>
                  <span className="font-medium text-foreground">Parcial:</span>{' '}
                  {habit.partialWeight}
                </span>
                <Badge variant="outline" className="text-xs">
                  {getFrequencyLabel(habit)}
                </Badge>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
              {isLoading ? (
                <div className="col-span-3 sm:col-span-1 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Button
                    size="default"
                    variant={active === CheckInStatus.Done ? 'success' : 'outline'}
                    onClick={() => handleClick(CheckInStatus.Done)}
                    disabled={active === CheckInStatus.Done}
                    title="Feito"
                    className="h-10 !w-full sm:!w-10 sm:px-0"
                  >
                    <Check className="h-5 w-5" />
                  </Button>

                  <Button
                    size="default"
                    variant={active === CheckInStatus.Partial ? 'warning' : 'outline'}
                    onClick={() => handleClick(CheckInStatus.Partial)}
                    disabled={active === CheckInStatus.Partial}
                    title="Parcial"
                    className="h-10 !w-full sm:!w-10 sm:px-0"
                  >
                    <Zap className="h-5 w-5" />
                  </Button>

                  <Button
                    size="default"
                    variant={active === CheckInStatus.Skipped ? 'secondary' : 'ghost'}
                    onClick={() => handleClick(CheckInStatus.Skipped)}
                    disabled={active === CheckInStatus.Skipped}
                    title="Pular"
                    className="h-10 !w-full sm:!w-10 sm:px-0"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação (só aparece ao trocar um check-in existente) */}
      {pendingStatus && checkIn && (
        <ConfirmChangeDialog
          open={!!pendingStatus}
          onOpenChange={(open) => { if (!open) setPendingStatus(null); }}
          habitName={habit.name}
          fromStatus={checkIn.status}
          toStatus={pendingStatus}
          onConfirm={handleConfirm}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
