import { apiClient } from './client';
import { DailyScore } from '../types/score';

export const scoresApi = {
  getToday: () =>
    apiClient.get<DailyScore>('/api/scores/today'),

  getByDate: (date: string) =>
    apiClient.get<DailyScore>(`/api/scores/${date}`),

  getWeekly: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get<DailyScore[]>(`/api/scores/week${params}`);
  },
};
