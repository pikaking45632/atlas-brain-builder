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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_silenced_until: {
        Row: {
          agent_id: string
          context: string
          created_at: string
          id: string
          silenced_until: string
          user_id: string
        }
        Insert: {
          agent_id: string
          context?: string
          created_at?: string
          id?: string
          silenced_until: string
          user_id: string
        }
        Update: {
          agent_id?: string
          context?: string
          created_at?: string
          id?: string
          silenced_until?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_sources: {
        Row: {
          connected_at: string
          id: string
          source_name: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          connected_at?: string
          id?: string
          source_name: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          connected_at?: string
          id?: string
          source_name?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_sources_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          handled: boolean
          handled_at: string | null
          id: string
          ip_hash: string | null
          message: string | null
          name: string
          source: string | null
          team_size: string | null
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          handled?: boolean
          handled_at?: string | null
          id?: string
          ip_hash?: string | null
          message?: string | null
          name: string
          source?: string | null
          team_size?: string | null
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          handled?: boolean
          handled_at?: string | null
          id?: string
          ip_hash?: string | null
          message?: string | null
          name?: string
          source?: string | null
          team_size?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_waitlist: {
        Row: {
          created_at: string
          email: string
          feature_key: string
          id: string
          note: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          feature_key: string
          id?: string
          note?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          feature_key?: string
          id?: string
          note?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_waitlist_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      hired_agents: {
        Row: {
          agent_id: string
          custom_name: string | null
          desk_color: string
          desk_lighting: string
          desk_plant: string
          desk_poster: string
          detail: number
          focus_areas: Json
          grid_x: number
          grid_y: number
          hired_at: string
          id: string
          initiative: number
          tone: number
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          agent_id: string
          custom_name?: string | null
          desk_color?: string
          desk_lighting?: string
          desk_plant?: string
          desk_poster?: string
          detail?: number
          focus_areas?: Json
          grid_x?: number
          grid_y?: number
          hired_at?: string
          id?: string
          initiative?: number
          tone?: number
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string
          custom_name?: string | null
          desk_color?: string
          desk_lighting?: string
          desk_plant?: string
          desk_poster?: string
          detail?: number
          focus_areas?: Json
          grid_x?: number
          grid_y?: number
          hired_at?: string
          id?: string
          initiative?: number
          tone?: number
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hired_agents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          company_name: string
          created_at: string
          email_domain: string
          expires_at: string | null
          id: string
          invite_code: string
          invited_by: string
          max_uses: number | null
          uses: number | null
          workspace_id: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          email_domain: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_by: string
          max_uses?: number | null
          uses?: number | null
          workspace_id?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          email_domain?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_by?: string
          max_uses?: number | null
          uses?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_emails: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invitation_id: string
          invited_by: string
          recipient_email: string
          role: string
          sent_at: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invitation_id: string
          invited_by: string
          recipient_email: string
          role?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invitation_id?: string
          invited_by?: string
          recipient_email?: string
          role?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_emails_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          email: string | null
          email_domain: string | null
          full_name: string | null
          id: string
          invite_code: string | null
          job_title: string | null
          key_activities: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_domain?: string | null
          full_name?: string | null
          id?: string
          invite_code?: string | null
          job_title?: string | null
          key_activities?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_domain?: string | null
          full_name?: string | null
          id?: string
          invite_code?: string | null
          job_title?: string | null
          key_activities?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          business_type: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email_domain: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          plan: string | null
          selected_modules: Json | null
          slug: string
          team_size: string | null
          updated_at: string
        }
        Insert: {
          business_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email_domain?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          plan?: string | null
          selected_modules?: Json | null
          slug?: string
          team_size?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email_domain?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          plan?: string | null
          selected_modules?: Json | null
          slug?: string
          team_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_workspace_id: { Args: never; Returns: string }
      increment_invitation_uses: {
        Args: { p_invite_code: string }
        Returns: undefined
      }
      is_workspace_admin: { Args: { p_workspace_id: string }; Returns: boolean }
      is_workspace_member: {
        Args: { p_workspace_id: string }
        Returns: boolean
      }
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
