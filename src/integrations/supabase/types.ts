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
      customers: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          image_url: string | null
          job_id: string
          last_inspection_date: string | null
          location_description: string | null
          name: string
          next_due_date: string | null
          qr_code: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["device_status"]
          system_type: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          image_url?: string | null
          job_id: string
          last_inspection_date?: string | null
          location_description?: string | null
          name: string
          next_due_date?: string | null
          qr_code?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["device_status"]
          system_type?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          image_url?: string | null
          job_id?: string
          last_inspection_date?: string | null
          location_description?: string | null
          name?: string
          next_due_date?: string | null
          qr_code?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["device_status"]
          system_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          customer_id: string
          estimated_device_count: number | null
          id: string
          nc_reference: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["job_priority"]
          scheduled_date: string | null
          site_id: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          type: Database["public"]["Enums"]["job_type"]
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          customer_id: string
          estimated_device_count?: number | null
          id?: string
          nc_reference?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          scheduled_date?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          type?: Database["public"]["Enums"]["job_type"]
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          customer_id?: string
          estimated_device_count?: number | null
          id?: string
          nc_reference?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          scheduled_date?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          type?: Database["public"]["Enums"]["job_type"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      ncs: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          description: string | null
          device_id: string
          failed_checklist_items: string[] | null
          id: string
          job_id: string
          photo_evidence: string[] | null
          severity: Database["public"]["Enums"]["nc_severity"]
          site_id: string
          status: Database["public"]["Enums"]["nc_status"]
          technician_remarks: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          description?: string | null
          device_id: string
          failed_checklist_items?: string[] | null
          id?: string
          job_id: string
          photo_evidence?: string[] | null
          severity?: Database["public"]["Enums"]["nc_severity"]
          site_id: string
          status?: Database["public"]["Enums"]["nc_status"]
          technician_remarks?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          description?: string | null
          device_id?: string
          failed_checklist_items?: string[] | null
          id?: string
          job_id?: string
          photo_evidence?: string[] | null
          severity?: Database["public"]["Enums"]["nc_severity"]
          site_id?: string
          status?: Database["public"]["Enums"]["nc_status"]
          technician_remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ncs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_customer_ids: string[] | null
          assigned_site_ids: string[] | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
        }
        Insert: {
          assigned_customer_ids?: string[] | null
          assigned_site_ids?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name: string
        }
        Update: {
          assigned_customer_ids?: string[] | null
          assigned_site_ids?: string[] | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string | null
          created_at: string | null
          customer_id: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_id: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_id?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
      device_status: "pending" | "in-progress" | "completed" | "failed"
      job_priority: "low" | "medium" | "high" | "critical"
      job_status: "not-started" | "in-progress" | "completed"
      job_type: "maintenance" | "repair"
      nc_severity: "minor" | "critical"
      nc_status: "open" | "in-progress" | "closed"
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
      device_status: ["pending", "in-progress", "completed", "failed"],
      job_priority: ["low", "medium", "high", "critical"],
      job_status: ["not-started", "in-progress", "completed"],
      job_type: ["maintenance", "repair"],
      nc_severity: ["minor", "critical"],
      nc_status: ["open", "in-progress", "closed"],
    },
  },
} as const
