import { apiClient } from './client';
import { Habit, CreateHabitDto, UpdateHabitDto } from '../types/habit';

export const habitsApi = {
  getAll: (activeOnly = true) =>
    apiClient.get<Habit[]>(`/api/habits?activeOnly=${activeOnly}`),

  getById: (id: string) =>
    apiClient.get<Habit>(`/api/habits/${id}`),

  create: (data: CreateHabitDto) =>
    apiClient.post<Habit>('/api/habits', data),

  update: (id: string, data: UpdateHabitDto) =>
    apiClient.put<Habit>(`/api/habits/${id}`, data),

  archive: (id: string) =>
    apiClient.delete(`/api/habits/${id}`),
};
