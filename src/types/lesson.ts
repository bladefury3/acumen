
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

export interface ParsedSection {
  title: string;
  content: string[];
  activities?: Activity[];
  generated?: boolean;
}

export interface ParsedLesson {
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: {
    activity_name: string;
    description: string;
    instructions: string;
  }[];
}
