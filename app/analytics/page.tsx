'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { MonthlySummary } from '@/components/analytics/monthly-summary';
import { WeeklyProgress } from '@/components/analytics/weekly-progress';
import { HabitStats } from '@/components/analytics/habit-stats';
import { LoadingPage } from '@/components/shared/loading';
import { ErrorState } from '@/components/shared/error-state';
import { Button } from '@/components/ui/button';
import { useHabits } from '@/hooks/useHabits';
import { useCheckInsByDateRange } from '@/hooks/useCheckIns';
import { buildDailyScores, getDateRange, PeriodFilter } from '@/lib/utils/analytics';

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '3m', label: '3 meses' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const { startDate, endDate } = getDateRange(period);

  const { 
    data: habits, 
    isLoading: habitsLoading, 
    error: habitsError,
    refetch: refetchHabits 
  } = useHabits(true);

  const { 
    data: checkIns, 
    isLoading: checkInsLoading, 
    error: checkInsError,
    refetch: refetchCheckIns 
  } = useCheckInsByDateRange(startDate, endDate);

  const periodScores = useMemo(() => {
    if (!habits || !checkIns) return [];
    return buildDailyScores(habits, checkIns, startDate, endDate);
  }, [habits, checkIns, startDate, endDate]);

  const isLoading = habitsLoading || checkInsLoading;
  const error = habitsError || checkInsError;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <LoadingPage />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Erro ao carregar análises"
            message="Não foi possível carregar os dados de análise."
            onRetry={() => {
              refetchHabits();
              refetchCheckIns();
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Análise</h1>
            <p className="text-muted-foreground">Acompanhe seu progresso ao longo do tempo</p>
          </div>
          
          {/* Period Filter */}
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={period === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Monthly Summary */}
        <section>
          <MonthlySummary scores={periodScores} />
        </section>

        {/* Weekly Progress */}
        <section>
          <WeeklyProgress scores={periodScores} />
        </section>

        {/* Habit Stats */}
        <section>
          <HabitStats habits={habits || []} checkIns={checkIns || []} />
        </section>
      </div>
    </AppLayout>
  );
}
