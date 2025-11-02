// Supabase database types
// This will be auto-generated, but adding basic structure

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
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          avatar_url?: string;
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_anime_list: {
        Row: {
          id: string;
          user_id: string;
          anime_id: string;
          status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
          progress: number;
          score?: number;
          started_at?: string;
          completed_at?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          anime_id: string;
          status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
          progress?: number;
          score?: number;
          started_at?: string;
          completed_at?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          anime_id?: string;
          status?: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
          progress?: number;
          score?: number;
          started_at?: string;
          completed_at?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      anime_status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
    };
  };
}

