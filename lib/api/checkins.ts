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

  create: (data: CreateCheckInDto) =>
    apiClient.post<CheckIn>("/api/checkins", {
      ...data,
      date: getLocalDateString(),
    }),

  update: (id: string, data: UpdateCheckInDto) =>
    apiClient.put<CheckIn>(`/api/checkins/${id}`, data),
};
