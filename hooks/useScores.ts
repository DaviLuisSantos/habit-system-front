import { useQuery } from "@tanstack/react-query";
import { scoresApi } from "@/lib/api/scores";
import { getLocalDateString } from "@/lib/utils";

export function useTodayScore() {
  const today = getLocalDateString();

  return useQuery({
    queryKey: ["scores", "today", today],
    queryFn: async () => {
      const response = await scoresApi.getToday(today);
      return response.data;
    },
  });
}

export function useScoreByDate(date: string) {
  return useQuery({
    queryKey: ["scores", date],
    queryFn: async () => {
      const response = await scoresApi.getByDate(date);
      return response.data;
    },
    enabled: !!date,
  });
}

export function useWeeklyScores(date?: string) {
  const today = getLocalDateString();
  const targetDate = date || today;

  return useQuery({
    queryKey: ["scores", "week", targetDate, today],
    queryFn: async () => {
      const response = await scoresApi.getWeekly(targetDate, today);
      return response.data;
    },
  });
}
