"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { AppLayout } from "@/components/layout/app-layout";
import { MonthlySummary } from "@/components/analytics/monthly-summary";
import { WeeklyProgress } from "@/components/analytics/weekly-progress";
import { HabitStats } from "@/components/analytics/habit-stats";
import { LoadingPage } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/useHabits";
import { useCheckInsByDateRange } from "@/hooks/useCheckIns";
import { getDateRange, PeriodFilter } from "@/lib/utils/analytics";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { scoresApi } from "@/lib/api/scores";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string; days: number }[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "3m", label: "3 meses", days: 90 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const { startDate, endDate } = getDateRange(period);

  const currentPeriod = PERIOD_OPTIONS.find(p => p.value === period);
  const periodDays = currentPeriod?.days || 30;

  const {
    data: habits,
    isLoading: habitsLoading,
    error: habitsError,
    refetch: refetchHabits,
  } = useHabits(true);

  const {
    data: checkIns,
    isLoading: checkInsLoading,
    error: checkInsError,
    refetch: refetchCheckIns,
  } = useCheckInsByDateRange(startDate, endDate);

  const {
    data: periodScores,
    isLoading: scoresLoading,
    error: scoresError,
    refetch: refetchScores,
  } = useQuery({
    queryKey: ["scores", "range", startDate, endDate],
    queryFn: async () => {
      const dates = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      }).map((date) => format(date, "yyyy-MM-dd"));

      const responses = await Promise.allSettled(
        dates.map((date) => scoresApi.getByDate(date)),
      );
      return responses
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<
            Awaited<ReturnType<typeof scoresApi.getByDate>>
          > => result.status === "fulfilled",
        )
        .map((result) => result.value.data);
    },
  });

  const safePeriodScores = useMemo(() => periodScores || [], [periodScores]);

  const isLoading = habitsLoading || checkInsLoading || scoresLoading;
  const error = habitsError || checkInsError || scoresError;

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
              refetchScores();
            }}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Análise</h1>
              <p className="text-muted-foreground">
                Acompanhe seu progresso ao longo do tempo
              </p>
            </div>

            {/* Period Filter */}
            <div className="flex gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={period === option.value ? "default" : "outline"}
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
            <MonthlySummary
              scores={safePeriodScores}
              checkIns={checkIns || []}
            />
          </section>

          {/* Daily Progress Chart */}
          <section>
            <WeeklyProgress scores={safePeriodScores} periodDays={periodDays} />
          </section>

          {/* Habit Stats */}
          <section>
            <HabitStats habits={habits || []} checkIns={checkIns || []} />
          </section>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
