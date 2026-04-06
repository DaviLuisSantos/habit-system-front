import { useQuery } from '@tanstack/react-query';
import { scoresApi } from '@/lib/api/scores';

export function useTodayScore() {
  return useQuery({
    queryKey: ['scores', 'today'],
    queryFn: async () => {
      const response = await scoresApi.getToday();
      return response.data;
    },
  });
}

export function useScoreByDate(date: string) {
  return useQuery({
    queryKey: ['scores', date],
    queryFn: async () => {
      const response = await scoresApi.getByDate(date);
      return response.data;
    },
    enabled: !!date,
  });
}

export function useWeeklyScores(date?: string) {
  return useQuery({
    queryKey: ['scores', 'week', date || 'current'],
    queryFn: async () => {
      const response = await scoresApi.getWeekly(date);
      return response.data;
    },
  });
}
