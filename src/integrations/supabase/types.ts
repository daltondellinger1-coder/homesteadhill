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
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          end_date: string
          id: string
          source: string | null
          start_date: string
          summary: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          source?: string | null
          start_date: string
          summary?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          source?: string | null
          start_date?: string
          summary?: string | null
          unit_id?: string
        }
        Relationships: []
      }
      rental_applications: {
        Row: {
          additional_info: string | null
          alternate_phone: string | null
          applicant_signature: string
          booking_email: string
          booking_name: string
          booking_phone: string
          broken_lease: string | null
          check_in: string
          check_out: string
          checking_balance: string | null
          created_at: string
          current_address: string | null
          current_city_state_zip: string | null
          current_employer: string | null
          current_landlord_name: string | null
          current_landlord_phone: string | null
          current_monthly_rent: string | null
          current_move_in: string | null
          current_reason_moving: string | null
          date_of_birth: string | null
          desired_move_in: string | null
          drivers_license: string | null
          email: string
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          employer_phone: string | null
          employer_position: string | null
          evictions_count: string | null
          felonies_count: string | null
          first_name: string
          gross_wages: string | null
          has_checking_account: string | null
          has_savings_account: string | null
          hire_date: string | null
          how_heard: string | null
          how_long_live_here: string | null
          id: string
          last_name: string
          middle_initial: string | null
          nights: number
          other_income_amount: string | null
          other_income_explain: string | null
          other_income_sources: string | null
          pets: string | null
          phone_number: string
          prev1_address: string | null
          prev1_city_state_zip: string | null
          prev1_landlord_name: string | null
          prev1_landlord_phone: string | null
          prev1_monthly_rent: string | null
          prev1_move_in: string | null
          prev1_move_out: string | null
          prev1_reason_moving: string | null
          prev2_address: string | null
          prev2_city_state_zip: string | null
          prev2_landlord_name: string | null
          prev2_landlord_phone: string | null
          prev2_monthly_rent: string | null
          prev2_move_in: string | null
          prev2_move_out: string | null
          prev2_reason_moving: string | null
          reasons_not_pay_rent: string | null
          savings_balance: string | null
          signature_date: string
          smoke: string | null
          ssn: string | null
          status: string
          supervisor_name: string | null
          total_move_in_available: string | null
          unit_id: string
          vehicles_count: string | null
          who_else_living: string | null
          why_rent_to_you: string | null
        }
        Insert: {
          additional_info?: string | null
          alternate_phone?: string | null
          applicant_signature: string
          booking_email: string
          booking_name: string
          booking_phone: string
          broken_lease?: string | null
          check_in: string
          check_out: string
          checking_balance?: string | null
          created_at?: string
          current_address?: string | null
          current_city_state_zip?: string | null
          current_employer?: string | null
          current_landlord_name?: string | null
          current_landlord_phone?: string | null
          current_monthly_rent?: string | null
          current_move_in?: string | null
          current_reason_moving?: string | null
          date_of_birth?: string | null
          desired_move_in?: string | null
          drivers_license?: string | null
          email: string
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          employer_phone?: string | null
          employer_position?: string | null
          evictions_count?: string | null
          felonies_count?: string | null
          first_name: string
          gross_wages?: string | null
          has_checking_account?: string | null
          has_savings_account?: string | null
          hire_date?: string | null
          how_heard?: string | null
          how_long_live_here?: string | null
          id?: string
          last_name: string
          middle_initial?: string | null
          nights: number
          other_income_amount?: string | null
          other_income_explain?: string | null
          other_income_sources?: string | null
          pets?: string | null
          phone_number: string
          prev1_address?: string | null
          prev1_city_state_zip?: string | null
          prev1_landlord_name?: string | null
          prev1_landlord_phone?: string | null
          prev1_monthly_rent?: string | null
          prev1_move_in?: string | null
          prev1_move_out?: string | null
          prev1_reason_moving?: string | null
          prev2_address?: string | null
          prev2_city_state_zip?: string | null
          prev2_landlord_name?: string | null
          prev2_landlord_phone?: string | null
          prev2_monthly_rent?: string | null
          prev2_move_in?: string | null
          prev2_move_out?: string | null
          prev2_reason_moving?: string | null
          reasons_not_pay_rent?: string | null
          savings_balance?: string | null
          signature_date: string
          smoke?: string | null
          ssn?: string | null
          status?: string
          supervisor_name?: string | null
          total_move_in_available?: string | null
          unit_id: string
          vehicles_count?: string | null
          who_else_living?: string | null
          why_rent_to_you?: string | null
        }
        Update: {
          additional_info?: string | null
          alternate_phone?: string | null
          applicant_signature?: string
          booking_email?: string
          booking_name?: string
          booking_phone?: string
          broken_lease?: string | null
          check_in?: string
          check_out?: string
          checking_balance?: string | null
          created_at?: string
          current_address?: string | null
          current_city_state_zip?: string | null
          current_employer?: string | null
          current_landlord_name?: string | null
          current_landlord_phone?: string | null
          current_monthly_rent?: string | null
          current_move_in?: string | null
          current_reason_moving?: string | null
          date_of_birth?: string | null
          desired_move_in?: string | null
          drivers_license?: string | null
          email?: string
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          employer_phone?: string | null
          employer_position?: string | null
          evictions_count?: string | null
          felonies_count?: string | null
          first_name?: string
          gross_wages?: string | null
          has_checking_account?: string | null
          has_savings_account?: string | null
          hire_date?: string | null
          how_heard?: string | null
          how_long_live_here?: string | null
          id?: string
          last_name?: string
          middle_initial?: string | null
          nights?: number
          other_income_amount?: string | null
          other_income_explain?: string | null
          other_income_sources?: string | null
          pets?: string | null
          phone_number?: string
          prev1_address?: string | null
          prev1_city_state_zip?: string | null
          prev1_landlord_name?: string | null
          prev1_landlord_phone?: string | null
          prev1_monthly_rent?: string | null
          prev1_move_in?: string | null
          prev1_move_out?: string | null
          prev1_reason_moving?: string | null
          prev2_address?: string | null
          prev2_city_state_zip?: string | null
          prev2_landlord_name?: string | null
          prev2_landlord_phone?: string | null
          prev2_monthly_rent?: string | null
          prev2_move_in?: string | null
          prev2_move_out?: string | null
          prev2_reason_moving?: string | null
          reasons_not_pay_rent?: string | null
          savings_balance?: string | null
          signature_date?: string
          smoke?: string | null
          ssn?: string | null
          status?: string
          supervisor_name?: string | null
          total_move_in_available?: string | null
          unit_id?: string
          vehicles_count?: string | null
          who_else_living?: string | null
          why_rent_to_you?: string | null
        }
        Relationships: []
      }
      unit_calendars: {
        Row: {
          created_at: string
          ical_url: string
          id: string
          last_synced_at: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ical_url: string
          id?: string
          last_synced_at?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ical_url?: string
          id?: string
          last_synced_at?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_blocked_ranges: {
        Args: never
        Returns: {
          end_date: string
          start_date: string
          unit_id: string
        }[]
      }
      get_blocked_ranges: {
        Args: { p_unit_id: string }
        Returns: {
          end_date: string
          start_date: string
          unit_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
