import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          priority: "高" | "未指定"
          next_books: string[]
          level: number
          notes: string | null
          links: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          priority?: "高" | "未指定"
          next_books?: string[]
          level?: number
          notes?: string | null
          links?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          priority?: "高" | "未指定"
          next_books?: string[]
          level?: number
          notes?: string | null
          links?: string[] | null
          updated_at?: string
        }
      }
    }
  }
}