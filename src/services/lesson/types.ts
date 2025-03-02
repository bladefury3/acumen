
export interface ParsedLesson {
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: Activity[];
}

export interface Activity {
  activity_name: string;
  duration: string;
  steps: string[];
}
