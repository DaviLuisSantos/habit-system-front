import { eachDayOfInterval, format, parseISO, startOfWeek } from 'date-fns';
import { DailyScore } from '@/lib/types/score';
import { CheckIn, CheckInStatus } from '@/lib/types/checkin';
import { FrequencyType, Habit } from '@/lib/types/habit';

export type PeriodFilter = '7d' | '30d' | '3m';

export function getDateRange(period: PeriodFilter): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = format(today, 'yyyy-MM-dd');
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  let startDate: string;
  switch (period) {
    case '7d':
      startDate = format(new Date(today.getTime() - 6 * millisecondsPerDay), 'yyyy-MM-dd');
      break;
    case '30d':
      startDate = format(new Date(today.getTime() - 29 * millisecondsPerDay), 'yyyy-MM-dd');
      break;
    case '3m':
      startDate = format(new Date(today.getTime() - 89 * millisecondsPerDay), 'yyyy-MM-dd');
      break;
    default:
      startDate = format(new Date(today.getTime() - 6 * millisecondsPerDay), 'yyyy-MM-dd');
  }

  return { startDate, endDate };
}

export function isHabitExpectedOnDate(habit: Habit, date: Date): boolean {
  const weekDay = date.getDay();

  switch (habit.frequencyType) {
    case FrequencyType.Daily:
      return true;
    case FrequencyType.SpecificDays:
      return habit.frequencyDays?.includes(weekDay) ?? false;
    case FrequencyType.XTimesWeek:
      return true;
    default:
      return false;
  }
}

export function buildDailyScores(
  habits: Habit[],
  checkIns: CheckIn[],
  startDate: string,
  endDate: string
): DailyScore[] {
  const checkInMap = new Map(
    checkIns.map((checkIn) => [`${checkIn.date}:${checkIn.habitId}`, checkIn])
  );

  return eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const expectedHabits = habits.filter((habit) => isHabitExpectedOnDate(habit, date));

    const totalPossible = expectedHabits.reduce((total, habit) => total + habit.weight, 0);
    const totalEarned = expectedHabits.reduce((total, habit) => {
      const checkIn = checkInMap.get(`${dateKey}:${habit.id}`);

      if (!checkIn) return total;
      if (checkIn.status === CheckInStatus.Done) return total + habit.weight;
      if (checkIn.status === CheckInStatus.Partial) return total + habit.partialWeight;
      return total;
    }, 0);

    return {
      date: dateKey,
      totalPossible,
      totalEarned,
      percentage: totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0,
      calculatedAt: new Date().toISOString(),
    };
  });
}

export function groupDailyScoresByWeek(scores: DailyScore[]) {
  const weekMap = new Map<string, DailyScore[]>();

  scores.forEach((score) => {
    const date = parseISO(score.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }

    weekMap.get(weekKey)!.push(score);
  });

  return Array.from(weekMap.entries())
    .map(([weekKey, weekScores]) => {
      const weekStart = parseISO(weekKey);
      const avgPercentage = Math.round(
        weekScores.reduce((acc, score) => acc + score.percentage, 0) / weekScores.length
      );

      return {
        week: weekKey,
        weekLabel: format(weekStart, "d 'de' MMM"),
        avgPercentage,
        totalDays: weekScores.length,
      };
    })
    .sort((a, b) => a.week.localeCompare(b.week));
}