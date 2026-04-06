// CheckIn types

export enum CheckInStatus {
  Done = "Done",
  Partial = "Partial",
  Skipped = "Skipped"
}

export interface CheckIn {
  id: string;
  habitId: string;
  habitName: string;
  date: string; // "2026-04-06"
  status: CheckInStatus;
  note: string | null;
  createdAt: string;
}

export interface CreateCheckInDto {
  habitId: string;
  date: string; // "YYYY-MM-DD"
  status: CheckInStatus;
  note?: string | null;
}

export interface UpdateCheckInDto {
  status: CheckInStatus;
  note?: string | null;
}
