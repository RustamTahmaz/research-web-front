export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      customer_profiles: {
        Row: {
          city: string | null
          created_at: string
          delivery_address: string | null
          id: string
          preferred_categories: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          delivery_address?: string | null
          id?: string
          preferred_categories?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          delivery_address?: string | null
          id?: string
          preferred_categories?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_profiles: {
        Row: {
          created_at: string
          description: string | null
          farm_location: string
          farm_name: string
          farm_size: string | null
          id: string
          product_types: string[] | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          farm_location: string
          farm_name: string
          farm_size?: string | null
          id?: string
          product_types?: string[] | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          farm_location?: string
          farm_name?: string
          farm_size?: string | null
          id?: string
          product_types?: string[] | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          farmer_id: string
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          quantity_available: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          farmer_id: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          quantity_available?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          farmer_id?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          quantity_available?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      order_requests: {
        Row: {
          counter_quantity: number | null
          created_at: string
          customer_id: string
          customer_message: string | null
          customer_hidden: boolean
          delivery_address: string | null
          delivery_distance_km: number | null
          delivery_fee: number
          delivery_method: Database["public"]["Enums"]["delivery_method"] | null
          delivery_notes: string | null
          delivery_provider_type: Database["public"]["Enums"]["delivery_provider_type"] | null
          delivery_schedule_type: Database["public"]["Enums"]["delivery_schedule_type"] | null
          delivery_scheduled_for: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"] | null
          farmer_id: string
          farmer_message: string | null
          farmer_hidden: boolean
          id: string
          product_id: string
          refund_status: Database["public"]["Enums"]["refund_status"]
          requested_quantity: number
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          counter_quantity?: number | null
          created_at?: string
          customer_id: string
          customer_message?: string | null
          customer_hidden?: boolean
          delivery_address?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number
          delivery_method?: Database["public"]["Enums"]["delivery_method"] | null
          delivery_notes?: string | null
          delivery_provider_type?: Database["public"]["Enums"]["delivery_provider_type"] | null
          delivery_schedule_type?: Database["public"]["Enums"]["delivery_schedule_type"] | null
          delivery_scheduled_for?: string | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"] | null
          farmer_id: string
          farmer_message?: string | null
          farmer_hidden?: boolean
          id?: string
          product_id: string
          refund_status?: Database["public"]["Enums"]["refund_status"]
          requested_quantity: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          counter_quantity?: number | null
          created_at?: string
          customer_id?: string
          customer_message?: string | null
          customer_hidden?: boolean
          delivery_address?: string | null
          delivery_distance_km?: number | null
          delivery_fee?: number
          delivery_method?: Database["public"]["Enums"]["delivery_method"] | null
          delivery_notes?: string | null
          delivery_provider_type?: Database["public"]["Enums"]["delivery_provider_type"] | null
          delivery_schedule_type?: Database["public"]["Enums"]["delivery_schedule_type"] | null
          delivery_scheduled_for?: string | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"] | null
          farmer_id?: string
          farmer_message?: string | null
          farmer_hidden?: boolean
          id?: string
          product_id?: string
          refund_status?: Database["public"]["Enums"]["refund_status"]
          requested_quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_requests_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_reviews: {
        Row: {
          created_at: string
          customer_id: string
          farmer_id: string
          farmer_rating: number | null
          farmer_review_text: string | null
          id: string
          order_request_id: string
          product_id: string
          product_rating: number | null
          product_review_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          farmer_id: string
          farmer_rating?: number | null
          farmer_review_text?: string | null
          id?: string
          order_request_id: string
          product_id: string
          product_rating?: number | null
          product_review_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          farmer_id?: string
          farmer_rating?: number | null
          farmer_review_text?: string | null
          id?: string
          order_request_id?: string
          product_id?: string
          product_rating?: number | null
          product_review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_reviews_order_request_id_fkey"
            columns: ["order_request_id"]
            isOneToOne: true
            referencedRelation: "order_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_reviews_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      delivery_method: "pickup" | "third_party"
      delivery_provider_type: "farmer" | "company" | "local_carrier"
      delivery_schedule_type: "asap" | "scheduled"
      delivery_status: "pending_pickup" | "in_transit" | "delivered"
      order_status: "pending" | "approved" | "declined" | "confirmed" | "fulfilled" | "countered"
      refund_status: "none" | "requested" | "refunded"
      user_role: "farmer" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      delivery_method: ["pickup", "third_party"],
      delivery_provider_type: ["farmer", "company", "local_carrier"],
      delivery_schedule_type: ["asap", "scheduled"],
      delivery_status: ["pending_pickup", "in_transit", "delivered"],
      refund_status: ["none", "requested", "refunded"],
      user_role: ["farmer", "customer"],
    },
  },
} as const
