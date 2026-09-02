export interface AppSettings {
  id: 1;
  hourlyRate: number;
  normalEndTime: string;
  periodStartDay: number;
  periodEndDay: number;
  updatedAt: string;
}

export interface SettingsUpdate {
  hourlyRate?: number;
  normalEndTime?: string;
  periodStartDay?: number;
  periodEndDay?: number;
}
