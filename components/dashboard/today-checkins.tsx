'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { HabitCard } from '@/components/habits/habit-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingHabitsList } from '@/components/shared/loading';
import { ErrorState, EmptyState } from '@/components/shared/error-state';
import { useHabits } from '@/hooks/useHabits';
import { useTodayCheckIns, useCreateCheckIn } from '@/hooks/useCheckIns';
import { useToast } from '@/components/ui/toast';
import { Habit } from '@/lib/types/habit';
import { CheckInStatus } from '@/lib/types/checkin';
import { ListTodo } from 'lucide-react';

function isHabitExpectedToday(habit: Habit): boolean {
  const today = new Date().getDay();
  
  switch (habit.frequencyType) {
    case 'Daily':
      return true;
    case 'SpecificDays':
      return habit.frequencyDays?.includes(today) ?? false;
    case 'XTimesWeek':
      // For X times per week, we'll show it every day and let user decide
      return true;
    default:
      return false;
  }
}

export function TodayCheckins() {
  const { data: habits, isLoading: habitsLoading, error: habitsError, refetch: refetchHabits } = useHabits(true);
  const { data: checkIns, isLoading: checkInsLoading, error: checkInsError, refetch: refetchCheckIns } = useTodayCheckIns();
  const createCheckIn = useCreateCheckIn();
  const { addToast } = useToast();
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  const isLoading = habitsLoading || checkInsLoading;
  const error = habitsError || checkInsError;

  const handleCheckIn = async (habitId: string, status: CheckInStatus) => {
    setLoadingHabitId(habitId);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await createCheckIn.mutateAsync({
        habitId,
        date: today,
        status,
      });
      addToast({
        type: 'success',
        title: 'Check-in registrado!',
        description: status === CheckInStatus.Done 
          ? 'Parabéns pelo progresso!' 
          : status === CheckInStatus.Partial 
            ? 'Bom trabalho! Cada passo conta.' 
            : 'Tudo bem, amanhã é um novo dia!',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Erro ao registrar check-in',
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setLoadingHabitId(null);
    }
  };

  if (isLoading) {
    return <LoadingHabitsList />;
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar hábitos"
        message="Não foi possível carregar seus hábitos. Tente novamente."
        onRetry={() => {
          refetchHabits();
          refetchCheckIns();
        }}
      />
    );
  }

  const todaysHabits = habits?.filter(isHabitExpectedToday) || [];
  const checkInsMap = new Map(checkIns?.map(c => [c.habitId, c]) || []);

  const pendingHabits = todaysHabits.filter(h => !checkInsMap.has(h.id));
  const completedHabits = todaysHabits.filter(h => checkInsMap.has(h.id));

  if (todaysHabits.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="h-12 w-12" />}
        title="Nenhum hábito para hoje"
        description="Você ainda não tem hábitos configurados para hoje. Crie novos hábitos para começar a acompanhar seu progresso."
        action={{
          label: 'Criar hábito',
          onClick: () => window.location.href = '/habits/new',
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {pendingHabits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📋</span>
              Pendentes
              <span className="text-sm font-normal text-muted-foreground">
                ({pendingHabits.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkIn={checkInsMap.get(habit.id)}
                onCheckIn={(status) => handleCheckIn(habit.id, status)}
                isLoading={loadingHabitId === habit.id}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {completedHabits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>✅</span>
              Concluídos
              <span className="text-sm font-normal text-muted-foreground">
                ({completedHabits.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkIn={checkInsMap.get(habit.id)}
                onCheckIn={(status) => handleCheckIn(habit.id, status)}
                isLoading={loadingHabitId === habit.id}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
