'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { MonthCalendar } from '@/components/history/month-calendar';
import { DayPanel } from '@/components/history/day-panel';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/shared/error-state';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { useHabits } from '@/hooks/useHabits';
import { useMonthCheckIns } from '@/hooks/useCheckIns';
import { getLocalDateString } from '@/lib/utils';

export default function HistoryPage() {
  const today = new Date();

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());  // 0-indexed

  // Abre a página já mostrando hoje no painel lateral
  const [selectedDate, setSelectedDate] = useState<string | null>(
    getLocalDateString(),
  );

  const {
    data: habits,
    isLoading: habitsLoading,
    error: habitsError,
    refetch: refetchHabits,
  } = useHabits(true);

  const {
    data: monthCheckIns,
    isLoading: checkInsLoading,
  } = useMonthCheckIns(year, month);

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setSelectedDate(null); // limpa seleção ao trocar de mês
  };

  const isCalendarLoading = habitsLoading || checkInsLoading;

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Histórico
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione um dia para registrar ou corrigir check-ins
            </p>
          </div>

          {habitsError ? (
            <ErrorState
              title="Erro ao carregar hábitos"
              message="Não foi possível carregar os dados. Tente novamente."
              onRetry={() => refetchHabits()}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* ── Calendário ── */}
              <Card>
                <CardContent className="p-4">
                  {isCalendarLoading ? (
                    <div className="flex items-center justify-center h-56">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <MonthCalendar
                      year={year}
                      month={month}
                      habits={habits ?? []}
                      checkIns={monthCheckIns ?? []}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      onMonthChange={handleMonthChange}
                    />
                  )}
                </CardContent>
              </Card>

              {/* ── Painel do dia ── */}
              <div>
                {selectedDate ? (
                  <DayPanel
                    key={selectedDate}   /* força remount ao trocar de dia */
                    date={selectedDate}
                    habits={habits ?? []}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 flex flex-col items-center gap-3 text-center text-muted-foreground">
                      <Calendar className="h-10 w-10 opacity-25" />
                      <p className="text-sm">
                        Selecione um dia no calendário para ver ou editar os check-ins.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
