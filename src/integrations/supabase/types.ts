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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
