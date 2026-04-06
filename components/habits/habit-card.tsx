'use client';

import { Check, Zap, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit, FrequencyType } from '@/lib/types/habit';
import { CheckIn, CheckInStatus } from '@/lib/types/checkin';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  checkIn?: CheckIn;
  onCheckIn: (status: CheckInStatus) => void;
  isLoading?: boolean;
}

function getFrequencyLabel(habit: Habit): string {
  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return 'Diário';
    case FrequencyType.SpecificDays:
      const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      return habit.frequencyDays?.map(d => days[d]).join(', ') || '';
    case FrequencyType.XTimesWeek:
      return `${habit.frequencyTimes}x/semana`;
    default:
      return '';
  }
}

function getStatusBadge(status: CheckInStatus) {
  switch (status) {
    case CheckInStatus.Done:
      return <Badge variant="success">Feito</Badge>;
    case CheckInStatus.Partial:
      return <Badge variant="warning">Parcial</Badge>;
    case CheckInStatus.Skipped:
      return <Badge variant="secondary">Pulado</Badge>;
    default:
      return null;
  }
}

function getCardStyle(checkIn?: CheckIn): string {
  if (!checkIn) return 'border-border';
  switch (checkIn.status) {
    case CheckInStatus.Done:
      return 'border-green-500/40 bg-green-500/10';
    case CheckInStatus.Partial:
      return 'border-yellow-500/40 bg-yellow-500/10';
    case CheckInStatus.Skipped:
      return 'border-border bg-muted/50';
    default:
      return 'border-border';
  }
}

export function HabitCard({ habit, checkIn, onCheckIn, isLoading }: HabitCardProps) {
  const hasCheckIn = !!checkIn;

  return (
    <Card className={cn('transition-colors', getCardStyle(checkIn))}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{habit.name}</h3>
              {hasCheckIn && getStatusBadge(checkIn.status)}
            </div>
            
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate mb-2">
                {habit.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">Peso:</span> {habit.weight}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-foreground">Parcial:</span> {habit.partialWeight}
              </span>
              <Badge variant="outline" className="text-xs">
                {getFrequencyLabel(habit)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Button
                  size="icon"
                  variant={checkIn?.status === CheckInStatus.Done ? 'success' : 'outline'}
                  onClick={() => onCheckIn(CheckInStatus.Done)}
                  disabled={hasCheckIn}
                  title="Feito"
                  className="h-10 w-10"
                >
                  <Check className="h-5 w-5" />
                </Button>
                
                <Button
                  size="icon"
                  variant={checkIn?.status === CheckInStatus.Partial ? 'warning' : 'outline'}
                  onClick={() => onCheckIn(CheckInStatus.Partial)}
                  disabled={hasCheckIn}
                  title="Parcial"
                  className="h-10 w-10"
                >
                  <Zap className="h-5 w-5" />
                </Button>
                
                <Button
                  size="icon"
                  variant={checkIn?.status === CheckInStatus.Skipped ? 'secondary' : 'ghost'}
                  onClick={() => onCheckIn(CheckInStatus.Skipped)}
                  disabled={hasCheckIn}
                  title="Pular"
                  className="h-10 w-10"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
