import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '@/lib/api/habits';
import { CreateHabitDto, UpdateHabitDto } from '@/lib/types/habit';

export function useHabits(activeOnly = true) {
  return useQuery({
    queryKey: ['habits', activeOnly],
    queryFn: async () => {
      const response = await habitsApi.getAll(activeOnly);
      return response.data;
    },
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habits', id],
    queryFn: async () => {
      const response = await habitsApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHabitDto) => {
      const response = await habitsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateHabitDto }) => {
      const response = await habitsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits', variables.id] });
    },
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await habitsApi.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
