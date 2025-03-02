
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
  created_at: string;
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
}

// Updated ParsedSection to handle both regular content and activities
export interface ParsedSection {
  title: string;
  content: string[];
  generated?: boolean;
  // Remove the activities property as we're treating all sections the same
}
