import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkInsApi } from "@/lib/api/checkins";
import { CreateCheckInDto, UpdateCheckInDto } from "@/lib/types/checkin";
import { getLocalDateString } from "@/lib/utils";

export function useTodayCheckIns() {
  const today = getLocalDateString();

  return useQuery({
    queryKey: ["checkIns", "today", today],
    queryFn: async () => {
      const response = await checkInsApi.getToday(today);
      return response.data;
    },
  });
}

export function useCheckInsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["checkIns", startDate, endDate],
    queryFn: async () => {
      const response = await checkInsApi.getByDateRange(startDate, endDate);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useMonthCheckIns(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return useQuery({
    queryKey: ["checkIns", "month", year, month],
    queryFn: async () => {
      const response = await checkInsApi.getByDateRange(startDate, endDate);
      return response.data;
    },
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCheckInDto) => {
      const response = await checkInsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      queryClient.invalidateQueries({ queryKey: ["scores"] });
    },
  });
}

export function useUpdateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCheckInDto;
    }) => {
      const response = await checkInsApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      queryClient.invalidateQueries({ queryKey: ["scores"] });
    },
  });
}
