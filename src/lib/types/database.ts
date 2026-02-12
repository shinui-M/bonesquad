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
      profiles: {
        Row: {
          id: string
          name: string
          bio: string | null
          avatar_url: string | null
          avatar_style: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          bio?: string | null
          avatar_url?: string | null
          avatar_style?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bio?: string | null
          avatar_url?: string | null
          avatar_style?: string
          created_at?: string
          updated_at?: string
        }
      }
      weekly_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          rating: number | null
          content: WeeklyLogContent
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          rating?: number | null
          content: WeeklyLogContent
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          rating?: number | null
          content?: WeeklyLogContent
          created_at?: string
          updated_at?: string
        }
      }
      feeds: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          feed_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          feed_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          feed_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          emoji: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          emoji?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          emoji?: string | null
          created_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
        }
      }
      group_posts: {
        Row: {
          id: string
          group_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      diet_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          breakfast: string | null
          lunch: string | null
          dinner: string | null
          snack: string | null
          exercise: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          breakfast?: string | null
          lunch?: string | null
          dinner?: string | null
          snack?: string | null
          exercise?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          breakfast?: string | null
          lunch?: string | null
          dinner?: string | null
          snack?: string | null
          exercise?: string | null
          created_at?: string
          updated_at?: string
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

// Custom types for content
export interface WeeklyLogItem {
  category: string
  content: string
}

export interface WeeklyLogContent {
  items: WeeklyLogItem[]
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type WeeklyLog = Database['public']['Tables']['weekly_logs']['Row']
export type Feed = Database['public']['Tables']['feeds']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupPost = Database['public']['Tables']['group_posts']['Row']
export type DietLog = Database['public']['Tables']['diet_logs']['Row']

// Extended types with relations
export interface FeedWithAuthor extends Feed {
  profiles: Profile
  comments?: CommentWithAuthor[]
}

export interface CommentWithAuthor extends Comment {
  profiles: Profile
}

export interface WeeklyLogWithAuthor extends WeeklyLog {
  profiles: Profile
}

export interface GroupMemberWithProfile extends GroupMember {
  profiles: Profile
}

export interface GroupPostWithAuthor extends GroupPost {
  profiles: Profile
}

export interface DietLogWithAuthor extends DietLog {
  profiles: Profile
}
