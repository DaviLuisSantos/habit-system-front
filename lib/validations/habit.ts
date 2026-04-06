import { z } from 'zod';
import { FrequencyType } from '@/lib/types/habit';

export const habitFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(280, 'Descrição deve ter no máximo 280 caracteres')
    .nullable()
    .optional(),
  weight: z
    .number()
    .min(1, 'Peso deve ser no mínimo 1')
    .max(10, 'Peso deve ser no máximo 10'),
  partialWeight: z
    .number()
    .min(0, 'Peso parcial deve ser no mínimo 0')
    .max(10, 'Peso parcial deve ser no máximo 10'),
  frequencyType: z.nativeEnum(FrequencyType),
  frequencyDays: z
    .array(z.number().min(0).max(6))
    .nullable()
    .optional(),
  frequencyTimes: z
    .number()
    .min(1, 'Frequência deve ser no mínimo 1')
    .max(7, 'Frequência deve ser no máximo 7')
    .nullable()
    .optional(),
}).refine((data) => {
  // Validate that partialWeight is not greater than weight
  return data.partialWeight <= data.weight;
}, {
  message: 'Peso parcial não pode ser maior que o peso total',
  path: ['partialWeight'],
}).refine((data) => {
  // Validate specific days are provided when frequencyType is SpecificDays
  if (data.frequencyType === FrequencyType.SpecificDays) {
    return data.frequencyDays && data.frequencyDays.length > 0;
  }
  return true;
}, {
  message: 'Selecione pelo menos um dia',
  path: ['frequencyDays'],
}).refine((data) => {
  // Validate frequencyTimes is provided when frequencyType is XTimesWeek
  if (data.frequencyType === FrequencyType.XTimesWeek) {
    return data.frequencyTimes !== null && data.frequencyTimes !== undefined;
  }
  return true;
}, {
  message: 'Informe quantas vezes por semana',
  path: ['frequencyTimes'],
});

export type HabitFormData = z.infer<typeof habitFormSchema>;

export const defaultHabitFormValues: HabitFormData = {
  name: '',
  description: null,
  weight: 5,
  partialWeight: 2,
  frequencyType: FrequencyType.Daily,
  frequencyDays: null,
  frequencyTimes: null,
};
