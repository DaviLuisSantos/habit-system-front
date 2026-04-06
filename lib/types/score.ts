// Score types

export interface DailyScore {
  date: string; // "2026-04-06"
  totalPossible: number;
  totalEarned: number;
  percentage: number;
  calculatedAt: string;
}
