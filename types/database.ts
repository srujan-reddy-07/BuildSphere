export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          role: 'user' | 'business' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          role?: 'user' | 'business' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          role?: 'user' | 'business' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          city: string | null
          state: string | null
          bio: string | null
          avatar_url: string | null
          availability: 'full-time' | 'part-time' | 'freelance' | 'not-available' | null
          experience_years: number | null
          education: Json | null
          social_links: Json | null
          resume_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          city?: string | null
          state?: string | null
          bio?: string | null
          avatar_url?: string | null
          availability?: 'full-time' | 'part-time' | 'freelance' | 'not-available' | null
          experience_years?: number | null
          education?: Json | null
          social_links?: Json | null
          resume_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          city?: string | null
          state?: string | null
          bio?: string | null
          avatar_url?: string | null
          availability?: 'full-time' | 'part-time' | 'freelance' | 'not-available' | null
          experience_years?: number | null
          education?: Json | null
          social_links?: Json | null
          resume_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          user_id: string
          skill_id: string
          proficiency: 'beginner' | 'intermediate' | 'expert'
        }
        Insert: {
          user_id: string
          skill_id: string
          proficiency?: 'beginner' | 'intermediate' | 'expert'
        }
        Update: {
          user_id?: string
          skill_id?: string
          proficiency?: 'beginner' | 'intermediate' | 'expert'
        }
        Relationships: [
          {
            foreignKeyName: 'user_skills_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_skills_skill_id_fkey'
            columns: ['skill_id']
            isOneToOne: false
            referencedRelation: 'skills'
            referencedColumns: ['id']
          },
        ]
      }
      opportunities: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string
          type: 'job' | 'internship' | 'freelance' | 'project'
          location: string | null
          is_remote: boolean
          required_skills: string[]
          stipend_min: number | null
          stipend_max: number | null
          deadline: string | null
          status: 'open' | 'closed' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          description: string
          type: 'job' | 'internship' | 'freelance' | 'project'
          location?: string | null
          is_remote?: boolean
          required_skills?: string[]
          stipend_min?: number | null
          stipend_max?: number | null
          deadline?: string | null
          status?: 'open' | 'closed' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          description?: string
          type?: 'job' | 'internship' | 'freelance' | 'project'
          location?: string | null
          is_remote?: boolean
          required_skills?: string[]
          stipend_min?: number | null
          stipend_max?: number | null
          deadline?: string | null
          status?: 'open' | 'closed' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'opportunities_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      applications: {
        Row: {
          id: string
          opportunity_id: string
          user_id: string
          note: string | null
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          user_id: string
          note?: string | null
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          user_id?: string
          note?: string | null
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'applications_opportunity_id_fkey'
            columns: ['opportunity_id']
            isOneToOne: false
            referencedRelation: 'opportunities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'applications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      businesses: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          verified: boolean
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          website?: string | null
          verified?: boolean
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          website?: string | null
          verified?: boolean
          logo_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'businesses_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      resources: {
        Row: {
          id: string
          title: string
          category: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          category?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          url?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'user' | 'business' | 'admin'
      availability_status: 'full-time' | 'part-time' | 'freelance' | 'not-available'
      skill_proficiency: 'beginner' | 'intermediate' | 'expert'
      opportunity_type: 'job' | 'internship' | 'freelance' | 'project'
      opportunity_status: 'open' | 'closed' | 'draft'
      application_status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
      resource_difficulty: 'beginner' | 'intermediate' | 'advanced'
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Named convenience types
export type User = Tables<'users'>
export type Profile = Tables<'profiles'>
export type Skill = Tables<'skills'>
export type UserSkill = Tables<'user_skills'>
export type Opportunity = Tables<'opportunities'>
export type Application = Tables<'applications'>
export type Business = Tables<'businesses'>
export type Resource = Tables<'resources'>
export type Post = Tables<'posts'>

// Insert convenience types
export type ProfileInsert = TablesInsert<'profiles'>
export type OpportunityInsert = TablesInsert<'opportunities'>
export type ApplicationInsert = TablesInsert<'applications'>
export type PostInsert = TablesInsert<'posts'>

// Update convenience types
export type ProfileUpdate = TablesUpdate<'profiles'>
export type OpportunityUpdate = TablesUpdate<'opportunities'>
export type ApplicationUpdate = TablesUpdate<'applications'>
export type PostUpdate = TablesUpdate<'posts'>

// Enum convenience types
export type UserRole = Enums<'user_role'>
export type AvailabilityStatus = Enums<'availability_status'>
export type SkillProficiency = Enums<'skill_proficiency'>
export type OpportunityType = Enums<'opportunity_type'>
export type OpportunityStatus = Enums<'opportunity_status'>
export type ApplicationStatus = Enums<'application_status'>
export type ResourceDifficulty = Enums<'resource_difficulty'>
