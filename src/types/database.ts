export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ot_records: {
        Row: {
          id: number;
          work_date: string;
          end_time: string;
          ot_minutes: number;
          ot_amount: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          work_date: string;
          end_time: string;
          ot_minutes: number;
          ot_amount: number | string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          work_date?: string;
          end_time?: string;
          ot_minutes?: number;
          ot_amount?: number | string;
          note?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: number;
          hourly_rate: string;
          normal_end_time: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          hourly_rate?: number | string;
          normal_end_time?: string;
          updated_at?: string;
        };
        Update: {
          hourly_rate?: number | string;
          normal_end_time?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_themes: {
        Row: {
          id: string;
          name: string;
          config: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          config: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          config?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
