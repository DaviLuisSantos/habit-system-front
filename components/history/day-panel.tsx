'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryHabitCard } from './history-habit-card';
import { LoadingHabitsList } from '@/components/shared/loading';
import { ErrorState } from '@/components/shared/error-state';
import { useCheckInsByDateRange, useCreateCheckIn, useUpdateCheckIn } from '@/hooks/useCheckIns';
import { useToast } from '@/components/ui/toast';
import { Habit, FrequencyType } from '@/lib/types/habit';
import { CheckInStatus } from '@/lib/types/checkin';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Mantém o mesmo comportamento do today-checkins.tsx:
 * usa getDay() (0=Dom … 6=Sáb) e frequencyDays do backend (1=Seg … 7=Dom).
 * Hábitos XTimesWeek são exibidos todos os dias e o usuário decide.
 */
function isExpectedOn(habit: Habit, dayOfWeek: number): boolean {
  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return true;
    case FrequencyType.SpecificDays:
      return habit.frequencyDays?.includes(dayOfWeek) ?? false;
    case FrequencyType.XTimesWeek:
      return true;
    default:
      return false;
  }
}

// ─── componente ─────────────────────────────────────────────────────────────

interface DayPanelProps {
  date: string;    // 'YYYY-MM-DD'
  habits: Habit[];
}

export function DayPanel({ date, habits }: DayPanelProps) {
  const {
    data: checkIns,
    isLoading,
    error,
    refetch,
  } = useCheckInsByDateRange(date, date);

  const createCheckIn = useCreateCheckIn();
  const updateCheckIn = useUpdateCheckIn();
  const { addToast } = useToast();
  const [loadingHabitId, setLoadingHabitId] = useState<string | null>(null);

  // Parse a data sem risco de fuso (noon garante que getDay() esteja correto)
  const parsed    = new Date(date + 'T12:00:00');
  const dayOfWeek = parsed.getDay();
  const label     = format(parsed, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  const expectedHabits = habits.filter((h) => isExpectedOn(h, dayOfWeek));
  const checkInsMap    = new Map(checkIns?.map((c) => [c.habitId, c]) ?? []);

  // Hábitos com check-in que não estavam esperados (ex.: XTimesWeek marcado em dia extra)
  const extraCheckIns = checkIns?.filter(
    (c) => !expectedHabits.some((h) => h.id === c.habitId)
  ) ?? [];

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async (habitId: string, status: CheckInStatus) => {
    setLoadingHabitId(habitId);
    try {
      await createCheckIn.mutateAsync({ habitId, date, status });
      addToast({ type: 'success', title: 'Check-in registrado!' });
    } catch {
      addToast({ type: 'error', title: 'Erro ao registrar check-in' });
    } finally {
      setLoadingHabitId(null);
    }
  };

  const handleUpdate = async (checkInId: string, habitId: string, status: CheckInStatus) => {
    setLoadingHabitId(habitId);
    try {
      await updateCheckIn.mutateAsync({ id: checkInId, data: { status } });
      addToast({ type: 'success', title: 'Check-in atualizado!' });
    } catch {
      addToast({ type: 'error', title: 'Erro ao atualizar check-in' });
    } finally {
      setLoadingHabitId(null);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingHabitsList />;

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar check-ins"
        message="Não foi possível carregar os dados deste dia."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground capitalize">{label}</h2>

      {expectedHabits.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            Nenhum hábito esperado neste dia.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expectedHabits.map((habit) => (
            <HistoryHabitCard
              key={habit.id}
              habit={habit}
              checkIn={checkInsMap.get(habit.id)}
              onCreateCheckIn={(status) => handleCreate(habit.id, status)}
              onUpdateCheckIn={(id, status) => handleUpdate(id, habit.id, status)}
              isLoading={loadingHabitId === habit.id}
            />
          ))}
        </div>
      )}

      {/* Check-ins que existem mas não eram esperados neste dia (ex: XTimesWeek extra) */}
      {extraCheckIns.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Check-ins adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4 px-4">
            {extraCheckIns.map((ci) => {
              const habit = habits.find((h) => h.id === ci.habitId);
              if (!habit) return null;
              return (
                <HistoryHabitCard
                  key={habit.id}
                  habit={habit}
                  checkIn={ci}
                  onCreateCheckIn={(status) => handleCreate(habit.id, status)}
                  onUpdateCheckIn={(id, status) => handleUpdate(id, habit.id, status)}
                  isLoading={loadingHabitId === habit.id}
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
