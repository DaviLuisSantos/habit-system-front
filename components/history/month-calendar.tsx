'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Habit, FrequencyType } from '@/lib/types/habit';
import { CheckIn, CheckInStatus } from '@/lib/types/checkin';
import { getLocalDateString } from '@/lib/utils';

// ─── constantes ──────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Colunas da semana começando pela segunda (padrão BR) */
const WEEK_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// ─── cálculo de score (replica o ScoreCalculator do backend) ─────────────────

function isExpectedOnDayOfWeek(habit: Habit, dow: number): boolean {
  switch (habit.frequencyType) {
    case FrequencyType.Daily:        return true;
    case FrequencyType.SpecificDays: return habit.frequencyDays?.includes(dow) ?? false;
    case FrequencyType.XTimesWeek:   return false; // só conta quando há check-in
    default:                         return false;
  }
}

function computeScore(
  dateStr: string,
  habits: Habit[],
  allCheckIns: CheckIn[],
): number | null {
  const date       = new Date(dateStr + 'T12:00:00');
  const dow        = date.getDay();                          // 0=Dom … 6=Sáb
  const dayCheckIns = allCheckIns.filter((c) => c.date === dateStr);

  let possible = 0;
  let earned   = 0;

  for (const habit of habits) {
    const expected = isExpectedOnDayOfWeek(habit, dow);
    const ci       = dayCheckIns.find((c) => c.habitId === habit.id);

    if (expected) {
      possible += habit.weight;
    } else if (habit.frequencyType === FrequencyType.XTimesWeek && ci) {
      possible += habit.weight;
    }

    if (ci) {
      if (ci.status === CheckInStatus.Done)    earned += habit.weight;
      else if (ci.status === CheckInStatus.Partial) earned += habit.partialWeight;
    }
  }

  if (possible === 0) return null;
  return Math.round((earned / possible) * 100);
}

function dotColor(pct: number | null): string | null {
  if (pct === null)  return null;            // sem hábitos esperados → sem bolinha
  if (pct >= 80)     return 'bg-green-500';
  if (pct >= 50)     return 'bg-yellow-500';
  if (pct > 0)       return 'bg-orange-400';
  return 'bg-red-500';                       // 0 % com hábitos esperados
}

// ─── utilitário de data ───────────────────────────────────────────────────────

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── props ────────────────────────────────────────────────────────────────────

interface MonthCalendarProps {
  year:           number;
  month:          number;  // 0-indexed
  habits:         Habit[];
  checkIns:       CheckIn[];
  selectedDate:   string | null;
  onSelectDate:   (date: string) => void;
  onMonthChange:  (year: number, month: number) => void;
}

// ─── componente ───────────────────────────────────────────────────────────────

export function MonthCalendar({
  year,
  month,
  habits,
  checkIns,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: MonthCalendarProps) {
  const todayStr = getLocalDateString();

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  // ── navegação ──────────────────────────────────────────────────────────────

  const goToPrev = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else             onMonthChange(year, month - 1);
  };

  const goToNext = () => {
    if (isCurrentMonth) return;            // bloqueia meses futuros
    if (month === 11) onMonthChange(year + 1, 0);
    else              onMonthChange(year, month + 1);
  };

  // ── grid de dias (segunda → domingo) ──────────────────────────────────────

  const firstDayDow  = new Date(year, month, 1).getDay();   // 0=Dom … 6=Sáb
  const startOffset  = (firstDayDow + 6) % 7;               // converte para Seg=0
  const totalDays    = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  // Completa até múltiplo de 7
  while (cells.length % 7 !== 0) cells.push(null);

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3 select-none">
      {/* Cabeçalho: navegar mês */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goToPrev} aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold text-foreground text-sm">
          {MONTH_NAMES[month]} {year}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={isCurrentMonth}
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Labels dos dias da semana */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEK_HEADERS.map((h) => (
          <div
            key={h}
            className="text-center text-[11px] font-medium text-muted-foreground py-1"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Células de dias */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="h-10" />;
          }

          const dateStr  = toDateStr(year, month, day);
          const isFuture = dateStr > todayStr;
          const isToday  = dateStr === todayStr;
          const isSel    = dateStr === selectedDate;

          const pct    = isFuture ? null : computeScore(dateStr, habits, checkIns);
          const dot    = isFuture ? null : dotColor(pct);

          return (
            <button
              key={dateStr}
              onClick={() => { if (!isFuture) onSelectDate(dateStr); }}
              disabled={isFuture}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg h-10 text-sm transition-colors',
                isFuture
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-accent',
                isSel
                  ? 'bg-primary/15 ring-2 ring-primary font-semibold text-primary'
                  : isToday
                  ? 'font-semibold text-primary'
                  : 'text-foreground',
              )}
              aria-label={dateStr}
              aria-pressed={isSel}
            >
              <span className="leading-none">{day}</span>

              {/* Bolinha de score */}
              {dot && (
                <span
                  className={cn('absolute bottom-1 w-1.5 h-1.5 rounded-full', dot)}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
        {[
          { color: 'bg-green-500',  label: '≥ 80 %' },
          { color: 'bg-yellow-500', label: '50–79 %' },
          { color: 'bg-orange-400', label: '1–49 %' },
          { color: 'bg-red-500',    label: '0 %' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full inline-block', color)} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
