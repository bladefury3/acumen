
export interface ParsedLesson {
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: {
    activity_name: string;
    duration: string;
    steps: string[];
  }[];
}
