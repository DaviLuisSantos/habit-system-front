'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/app-layout';
import { ScoreWidget } from '@/components/dashboard/score-widget';
import { TodayCheckins } from '@/components/dashboard/today-checkins';
import { WeeklyChart } from '@/components/dashboard/weekly-chart';
import { LoadingScoreWidget } from '@/components/shared/loading';
import { ErrorState } from '@/components/shared/error-state';
import { useTodayScore, useWeeklyScores } from '@/hooks/useScores';

export default function DashboardPage() {
  const { data: todayScore, isLoading: scoreLoading, error: scoreError, refetch: refetchScore } = useTodayScore();
  const { data: weeklyScores } = useWeeklyScores();

  // Get yesterday's score for comparison
  const yesterdayScore = weeklyScores?.[weeklyScores.length - 2];

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>

        {/* Score Widget */}
        {scoreLoading ? (
          <LoadingScoreWidget />
        ) : scoreError ? (
          <ErrorState
            title="Erro ao carregar score"
            message="Não foi possível carregar seu score de hoje."
            onRetry={() => refetchScore()}
          />
        ) : todayScore ? (
          <ScoreWidget score={todayScore} previousScore={yesterdayScore} />
        ) : (
          <ScoreWidget 
            score={{ 
              date: format(new Date(), 'yyyy-MM-dd'), 
              totalPossible: 0, 
              totalEarned: 0, 
              percentage: 0,
              calculatedAt: new Date().toISOString()
            }} 
          />
        )}

        {/* Today's Check-ins */}
        <section>
          <TodayCheckins />
        </section>

        {/* Weekly Chart */}
        <section>
          <WeeklyChart />
        </section>
      </div>
    </AppLayout>
  );
}
