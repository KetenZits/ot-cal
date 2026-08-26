export interface AppSettings {
  id: 1;
  hourlyRate: number;
  normalEndTime: string;
  updatedAt: string;
}

export interface SettingsUpdate {
  hourlyRate?: number;
  normalEndTime?: string;
}
