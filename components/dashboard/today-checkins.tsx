'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startOfWeek } from 'date-fns';
import { HabitCard } from '@/components/habits/habit-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingHabitsList } from '@/components/shared/loading';
import { ErrorState, EmptyState } from '@/components/shared/error-state';
import { useHabits } from '@/hooks/useHabits';
import { useTodayCheckIns, useCreateCheckIn, useUpdateCheckIn, useCheckInsByDateRange } from '@/hooks/useCheckIns';
import { useToast } from '@/components/ui/toast';
import { Habit, FrequencyType } from '@/lib/types/habit';
import { CheckIn, CheckInStatus } from '@/lib/types/checkin';
import { getErrorMessage } from '@/lib/api/errors';
import { getLocalDateString } from '@/lib/utils';
import { ListTodo } from 'lucide-react';

function isHabitExpectedToday(habit: Habit): boolean {
  const today = new Date().getDay();
  
  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return true;
    case FrequencyType.SpecificDays:
      // frequencyDays: 0=Domingo … 6=Sábado (mesma convenção de Date.getDay())
      return habit.frequencyDays?.includes(today) ?? false;
    case FrequencyType.XTimesWeek:
      // X vezes por semana: aparece todos os dias e o usuário decide
      return true;
    default:
      return false;
  }
}

const SUCCESS_MESSAGES: Record<CheckInStatus, string> = {
  [CheckInStatus.Done]: 'Parabéns pelo progresso!',
  [CheckInStatus.Partial]: 'Bom trabalho! Cada passo conta.',
  [CheckInStatus.Skipped]: 'Tudo bem, amanhã é um novo dia!',
};

/** Conta check-ins Feito/Parcial por hábito na semana (segunda a domingo, como o backend). */
function countWeeklyCompletions(checkIns: CheckIn[] | undefined): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of checkIns ?? []) {
    if (c.status === CheckInStatus.Done || c.status === CheckInStatus.Partial) {
      counts.set(c.habitId, (counts.get(c.habitId) ?? 0) + 1);
    }
  }
  return counts;
}

export function TodayCheckins() {
  const router = useRouter();
  const todayStr = getLocalDateString();
  const weekStartStr = getLocalDateString(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const { data: habits, isLoading: habitsLoading, error: habitsError, refetch: refetchHabits } = useHabits(true);
  const { data: checkIns, isLoading: checkInsLoading, error: checkInsError, refetch: refetchCheckIns } = useTodayCheckIns();
  const { data: weekCheckIns } = useCheckInsByDateRange(weekStartStr, todayStr);
  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();
  const { addToast } = useToast();
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  const isLoading = habitsLoading || checkInsLoading;
  const error = habitsError || checkInsError;

  const handleCheckIn = async (habitId: string, status: CheckInStatus, existing?: CheckIn) => {
    if (existing?.status === status) return;
    setLoadingHabitId(habitId);
    try {
      if (existing) {
        await updateCheckIn.mutateAsync({ id: existing.id, data: { status, note: existing.note } });
        addToast({
          type: 'success',
          title: 'Check-in atualizado!',
          description: SUCCESS_MESSAGES[status],
        });
      } else {
        await createCheckIn.mutateAsync({
          habitId,
          date: todayStr,
          status,
        });
        addToast({
          type: 'success',
          title: 'Check-in registrado!',
          description: SUCCESS_MESSAGES[status],
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: existing ? 'Erro ao atualizar check-in' : 'Erro ao registrar check-in',
        description: getErrorMessage(err),
      });
      refetchCheckIns();
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
  const weeklyCounts = countWeeklyCompletions(weekCheckIns);

  const weeklyProgressFor = (habit: Habit) =>
    habit.frequencyType === FrequencyType.XTimesWeek && habit.frequencyTimes
      ? { completed: weeklyCounts.get(habit.id) ?? 0, target: habit.frequencyTimes }
      : undefined;

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
          onClick: () => router.push('/habits/new'),
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
                onCheckIn={(status) => handleCheckIn(habit.id, status, checkInsMap.get(habit.id))}
                isLoading={loadingHabitId === habit.id}
                weeklyProgress={weeklyProgressFor(habit)}
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
                onCheckIn={(status) => handleCheckIn(habit.id, status, checkInsMap.get(habit.id))}
                isLoading={loadingHabitId === habit.id}
                weeklyProgress={weeklyProgressFor(habit)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
