import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          target_count: number
          schedule: string[] // Array of times in HH:mm format
          notification_enabled: boolean
          reminder_minutes_before: number
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          target_count?: number
          schedule?: string[]
          notification_enabled?: boolean
          reminder_minutes_before?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          target_count?: number
          schedule?: string[]
          notification_enabled?: boolean
          reminder_minutes_before?: number
          is_active?: boolean
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_at: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_at?: string
          created_at?: string
        }
      }
      habit_skips: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          skip_date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          skip_date: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          skip_date?: string
          created_at?: string
        }
      }
    }
  }
} 