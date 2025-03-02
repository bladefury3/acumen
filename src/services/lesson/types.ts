
export interface ParsedLesson {
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: string;
}

// Legacy types for tests compatibility
export type ParsedLessonContent = Section[];

export interface Section {
  type: string;
  title: string;
  content: string[];
  markdownContent?: string;
  activities?: Array<{
    title: string;
    duration: string;
    steps: string[];
  }>;
}
