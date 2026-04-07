import { apiClient } from "./client";
import { DailyScore } from "../types/score";
import { getLocalDateString } from "../utils";

export const scoresApi = {
  getToday: (date = getLocalDateString()) =>
    apiClient.get<DailyScore>(`/api/scores/today?date=${date}`),

  getByDate: (date: string) => apiClient.get<DailyScore>(`/api/scores/${date}`),

  getWeekly: (date?: string) => {
    const params = date ? `?date=${date}` : "";
    return apiClient.get<DailyScore[]>(`/api/scores/week${params}`);
  },
};
