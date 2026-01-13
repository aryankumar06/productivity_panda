export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          status: 'todo' | 'in_progress' | 'completed'
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'completed'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'completed'
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          frequency: 'daily' | 'weekly'
          target_days: number
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          frequency?: 'daily' | 'weekly'
          target_days?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          frequency?: 'daily' | 'weekly'
          target_days?: number
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_date: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_date?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          event_date: string
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          event_date: string
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          event_date?: string
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    },
    Views: {
      [_ in never]: never
    },
    Functions: {
      [_ in never]: never
    },
    Enums: {
      [_ in never]: never
    }
  }
}
