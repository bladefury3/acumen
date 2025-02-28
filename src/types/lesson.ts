
export interface Activity {
  title: string;
  duration: string;
  steps: string[];
}

export interface ParsedSection {
  title: string;
  content: string[];
  activities?: Activity[];
}

export interface LessonPlanData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  objectives: string;
  grade: string;
  subject: string;
  fun_elements: string;
  duration: string;
  curriculum: string;
  learning_tools: string[];
  learning_needs: string[];
  activities: string[];
  assessments: string[];
  ai_response: string;
}

export interface Instruction {
  id: string;
  created_at: string;
  updated_at?: string; // Make updated_at optional to match Supabase response
  activities_detail_id: string;
  instruction_text: string;
}
