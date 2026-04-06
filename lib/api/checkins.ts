import { apiClient } from './client';
import { CheckIn, CreateCheckInDto, UpdateCheckInDto } from '../types/checkin';

export const checkInsApi = {
  getToday: () =>
    apiClient.get<CheckIn[]>('/api/checkins/today'),

  getByDateRange: (startDate: string, endDate: string) =>
    apiClient.get<CheckIn[]>(`/api/checkins?startDate=${startDate}&endDate=${endDate}`),

  create: (data: CreateCheckInDto) =>
    apiClient.post<CheckIn>('/api/checkins', data),

  update: (id: string, data: UpdateCheckInDto) =>
    apiClient.put<CheckIn>(`/api/checkins/${id}`, data),
};
