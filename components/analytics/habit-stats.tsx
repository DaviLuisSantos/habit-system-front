'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit } from '@/lib/types/habit';
import { CheckIn, CheckInStatus } from '@/lib/types/checkin';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Zap, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitStatsProps {
  habits: Habit[];
  checkIns: CheckIn[];
}

interface HabitStat {
  habit: Habit;
  totalCheckIns: number;
  doneCount: number;
  partialCount: number;
  skippedCount: number;
  successRate: number;
  lastCheckIn: CheckIn | null;
}

function calculateHabitStats(habits: Habit[], checkIns: CheckIn[]): HabitStat[] {
  return habits.map(habit => {
    const habitCheckIns = checkIns.filter(c => c.habitId === habit.id);
    const doneCount = habitCheckIns.filter(c => c.status === CheckInStatus.Done).length;
    const partialCount = habitCheckIns.filter(c => c.status === CheckInStatus.Partial).length;
    const skippedCount = habitCheckIns.filter(c => c.status === CheckInStatus.Skipped).length;
    
    const successRate = habitCheckIns.length > 0
      ? Math.round(((doneCount + partialCount * 0.5) / habitCheckIns.length) * 100)
      : 0;

    const lastCheckIn = habitCheckIns.length > 0
      ? habitCheckIns.reduce((latest, current) => 
          current.date > latest.date ? current : latest
        )
      : null;

    return {
      habit,
      totalCheckIns: habitCheckIns.length,
      doneCount,
      partialCount,
      skippedCount,
      successRate,
      lastCheckIn,
    };
  }).sort((a, b) => b.successRate - a.successRate);
}

function getSuccessRateBg(rate: number): string {
  if (rate >= 80) return 'bg-green-500/10 border-green-500/30';
  if (rate >= 60) return 'bg-blue-500/10 border-blue-500/30';
  if (rate >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-red-500/10 border-red-500/30';
}

function formatLastCheckIn(checkIn: CheckIn | null): string {
  if (!checkIn) return 'Nunca';
  
  const date = parseISO(checkIn.date);
  const today = new Date();
  const diff = differenceInDays(today, date);
  
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return format(date, "d 'de' MMM", { locale: ptBR });
}

export function HabitStats({ habits, checkIns }: HabitStatsProps) {
  const stats = calculateHabitStats(habits, checkIns);

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Estatísticas por Hábito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum hábito encontrado. Crie hábitos para ver estatísticas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📊 Estatísticas por Hábito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map(stat => (
            <div
              key={stat.habit.id}
              className={cn(
                'p-4 rounded-lg border',
                getSuccessRateBg(stat.successRate)
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">{stat.habit.name}</h4>
                    <Badge 
                      variant={stat.successRate >= 60 ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.successRate}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-green-400" />
                      {stat.doneCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      {stat.partialCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <SkipForward className="h-4 w-4 text-muted-foreground" />
                      {stat.skippedCount}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Último check-in</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatLastCheckIn(stat.lastCheckIn)}
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    stat.successRate >= 80 ? 'bg-green-500' :
                    stat.successRate >= 60 ? 'bg-blue-500' :
                    stat.successRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${stat.successRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
