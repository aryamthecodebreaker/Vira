export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          auth_type: 'google' | 'guest'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          budget_min: number | null
          budget_max: number | null
          locations: string[]
          property_types: string[]
          bhk_preferences: string[]
          purpose: string | null
          timeline: string | null
          amenities: string[]
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_preferences']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>
      }
      properties: {
        Row: {
          id: string
          name: string
          location: string
          city: string
          lat: number | null
          lng: number | null
          type: string
          configurations: string[]
          price_min: number
          price_max: number
          photos: string[]
          description: string | null
          website: string | null
          developer: string | null
          rera_number: string | null
          amenities: string[]
          usps: string[]
          status: 'approved' | 'pending' | 'rejected'
          source: 'partner' | 'owner' | 'scraped'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      property_views: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['property_views']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['property_views']['Insert']>
      }
      partner_submissions: {
        Row: {
          id: string
          agent_name: string
          agency: string | null
          contact_email: string
          contact_phone: string | null
          property_id: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partner_submissions']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['partner_submissions']['Insert']>
      }
      owner_submissions: {
        Row: {
          id: string
          owner_name: string
          contact_email: string
          contact_phone: string | null
          property_id: string
          legal_status: string | null
          negotiable: boolean
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['owner_submissions']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['owner_submissions']['Insert']>
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyView = Database['public']['Tables']['property_views']['Row']
export type PartnerSubmission = Database['public']['Tables']['partner_submissions']['Row']
export type OwnerSubmission = Database['public']['Tables']['owner_submissions']['Row']
