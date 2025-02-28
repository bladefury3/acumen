
export interface LessonPlanData {
  id: string;
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

export interface Activity {
  title: string;
  duration: string;
  steps: string[];
}

export interface Instruction {
  id: string;
  instruction_text: string;
  activities_detail_id: string;
  created_at: string;
  updated_at?: string; // Made this optional to fix the error
}

export interface ParsedSection {
  title: string;
  content: string[];
  activities?: Activity[];
  generated?: boolean;
}
