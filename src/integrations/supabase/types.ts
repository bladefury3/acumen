export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      activities_detail: {
        Row: {
          activity_name: string
          created_at: string
          description: string
          id: string
          instructions: string
          lesson_id: string | null
          updated_at: string
        }
        Insert: {
          activity_name: string
          created_at?: string
          description: string
          id?: string
          instructions: string
          lesson_id?: string | null
          updated_at?: string
        }
        Update: {
          activity_name?: string
          created_at?: string
          description?: string
          id?: string
          instructions?: string
          lesson_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_detail_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_methods: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      curriculum_standards: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      grade_levels: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      instructions: {
        Row: {
          activities_detail_id: string
          created_at: string
          id: string
          instruction_text: string
        }
        Insert: {
          activities_detail_id: string
          created_at?: string
          id?: string
          instruction_text: string
        }
        Update: {
          activities_detail_id?: string
          created_at?: string
          id?: string
          instruction_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "instructions_activities_detail_id_fkey"
            columns: ["activities_detail_id"]
            isOneToOne: false
            referencedRelation: "activities_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_needs: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      learning_tools: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      lesson_plans: {
        Row: {
          activities: string[] | null
          ai_response: string | null
          assessments: string[] | null
          created_at: string
          curriculum: string
          duration: string
          fun_elements: string | null
          grade: string
          id: string
          learning_needs: string[] | null
          learning_tools: string[] | null
          objectives: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activities?: string[] | null
          ai_response?: string | null
          assessments?: string[] | null
          created_at?: string
          curriculum: string
          duration: string
          fun_elements?: string | null
          grade: string
          id?: string
          learning_needs?: string[] | null
          learning_tools?: string[] | null
          objectives: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activities?: string[] | null
          ai_response?: string | null
          assessments?: string[] | null
          created_at?: string
          curriculum?: string
          duration?: string
          fun_elements?: string | null
          grade?: string
          id?: string
          learning_needs?: string[] | null
          learning_tools?: string[] | null
          objectives?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_resources: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_plan_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_plan_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_plan_id_fkey"
            columns: ["lesson_plan_id"]
            isOneToOne: false
            referencedRelation: "lesson_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          activities: string | null
          assessment_strategies: string
          close: string
          created_at: string
          differentiation_strategies: string
          id: string
          introduction_hook: string
          learning_objectives: string
          materials_resources: string
          response_id: string | null
          updated_at: string
        }
        Insert: {
          activities?: string | null
          assessment_strategies: string
          close: string
          created_at?: string
          differentiation_strategies: string
          id?: string
          introduction_hook: string
          learning_objectives: string
          materials_resources: string
          response_id?: string | null
          updated_at?: string
        }
        Update: {
          activities?: string | null
          assessment_strategies?: string
          close?: string
          created_at?: string
          differentiation_strategies?: string
          id?: string
          introduction_hook?: string
          learning_objectives?: string
          materials_resources?: string
          response_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "lesson_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          goals: string[] | null
          grade: string[] | null
          id: string
          subjects: string[] | null
          updated_at: string
          username: string
        }
        Insert: {
          goals?: string[] | null
          grade?: string[] | null
          id: string
          subjects?: string[] | null
          updated_at?: string
          username: string
        }
        Update: {
          goals?: string[] | null
          grade?: string[] | null
          id?: string
          subjects?: string[] | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_lesson_resources_by_lesson_id: {
        Args: { p_lesson_plan_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          lesson_plan_id: string
        }[]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
