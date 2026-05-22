import { apiClient } from "./client";
import { CheckIn, CreateCheckInDto, UpdateCheckInDto } from "../types/checkin";
import { getLocalDateString } from "../utils";

export const checkInsApi = {
  getToday: (date = getLocalDateString()) =>
    apiClient.get<CheckIn[]>(`/api/checkins/today?date=${date}`),

  getByDateRange: (startDate: string, endDate: string) =>
    apiClient.get<CheckIn[]>(
      `/api/checkins?startDate=${startDate}&endDate=${endDate}`,
    ),

  // Envia data exatamente como fornecida no DTO (sem sobrescrever com hoje)
  create: (data: CreateCheckInDto) =>
    apiClient.post<CheckIn>("/api/checkins", data),

  update: (id: string, data: UpdateCheckInDto) =>
    apiClient.put<CheckIn>(`/api/checkins/${id}`, data),
};
