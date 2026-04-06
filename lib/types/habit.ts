// TypeScript types mirroring the backend

export enum FrequencyType {
  Daily = "Daily",
  SpecificDays = "SpecificDays",
  XTimesWeek = "XTimesWeek"
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  partialWeight: number;
  frequencyType: FrequencyType;
  frequencyDays: number[] | null;
  frequencyTimes: number | null;
  isActive: boolean;
  createdAt: string;
  archivedAt: string | null;
}

export interface CreateHabitDto {
  name: string;
  description?: string | null;
  weight: number;
  partialWeight: number;
  frequencyType: FrequencyType;
  frequencyDays?: number[] | null;
  frequencyTimes?: number | null;
}

export interface UpdateHabitDto {
  name: string;
  description?: string | null;
  weight: number;
  partialWeight: number;
  frequencyType: FrequencyType;
  frequencyDays?: number[] | null;
  frequencyTimes?: number | null;
}
