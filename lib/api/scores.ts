import { apiClient } from "./client";
import { DailyScore } from "../types/score";
import { getLocalDateString } from "../utils";

export const scoresApi = {
  getToday: (date = getLocalDateString()) =>
    apiClient.get<DailyScore>(`/api/scores/today?date=${date}`),

  getByDate: (date: string) => apiClient.get<DailyScore>(`/api/scores/${date}`),

  getWeekly: (date = getLocalDateString(), today = getLocalDateString()) => {
    const params = new URLSearchParams({ date, today });
    return apiClient.get<DailyScore[]>(`/api/scores/week?${params.toString()}`);
  },
};
