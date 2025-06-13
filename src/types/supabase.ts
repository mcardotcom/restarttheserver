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
      headlines: {
        Row: {
          id: string
          created_at: string
          title: string
          url: string
          source: string
          summary: string
          flame_score: number
          published_at: string
          category: string
          is_published: boolean
          is_breaking: boolean
          approved_by: string | null
          metadata: Json
          moderation_status: 'pending' | 'approved' | 'rejected'
          moderation_notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          url: string
          source: string
          summary: string
          flame_score: number
          published_at: string
          category: string
          is_published?: boolean
          is_breaking?: boolean
          approved_by?: string | null
          metadata: Json
          moderation_status?: 'pending' | 'approved' | 'rejected'
          moderation_notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          url?: string
          source?: string
          summary?: string
          flame_score?: number
          published_at?: string
          category?: string
          is_published?: boolean
          is_breaking?: boolean
          approved_by?: string | null
          metadata?: Json
          moderation_status?: 'pending' | 'approved' | 'rejected'
          moderation_notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 