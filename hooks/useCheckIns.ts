import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInsApi } from '@/lib/api/checkins';
import { CreateCheckInDto, UpdateCheckInDto } from '@/lib/types/checkin';

export function useTodayCheckIns() {
  return useQuery({
    queryKey: ['checkIns', 'today'],
    queryFn: async () => {
      const response = await checkInsApi.getToday();
      return response.data;
    },
  });
}

export function useCheckInsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['checkIns', startDate, endDate],
    queryFn: async () => {
      const response = await checkInsApi.getByDateRange(startDate, endDate);
      return response.data;
    },
    enabled: !!startDate && !!endDate,
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
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
  });
}

export function useUpdateCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCheckInDto }) => {
      const response = await checkInsApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
  });
}
