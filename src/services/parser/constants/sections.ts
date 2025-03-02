
/**
 * Central configuration for lesson plan sections
 */

// Standard section types
export const SECTION_TYPES = {
  LEARNING_OBJECTIVES: 'learning_objectives',
  MATERIALS_RESOURCES: 'materials_resources',
  INTRODUCTION_HOOK: 'introduction_hook',
  ACTIVITIES: 'activities',
  ASSESSMENT_STRATEGIES: 'assessment_strategies',
  DIFFERENTIATION_STRATEGIES: 'differentiation_strategies',
  CLOSE: 'close',
} as const;

// Display names for section types (for UI presentation)
export const SECTION_DISPLAY_NAMES: Record<string, string> = {
  [SECTION_TYPES.LEARNING_OBJECTIVES]: 'Learning Objectives',
  [SECTION_TYPES.MATERIALS_RESOURCES]: 'Materials & Resources',
  [SECTION_TYPES.INTRODUCTION_HOOK]: 'Introduction & Hook',
  [SECTION_TYPES.ACTIVITIES]: 'Activities',
  [SECTION_TYPES.ASSESSMENT_STRATEGIES]: 'Assessment Strategies',
  [SECTION_TYPES.DIFFERENTIATION_STRATEGIES]: 'Differentiation Strategies',
  [SECTION_TYPES.CLOSE]: 'Close',
};

// Pattern groups for identifying section types from AI response
export const SECTION_PATTERNS: Record<string, string[]> = {
  [SECTION_TYPES.LEARNING_OBJECTIVES]: ['learning objective', 'objective', 'goal'],
  [SECTION_TYPES.MATERIALS_RESOURCES]: ['material', 'resource', 'supply'],
  [SECTION_TYPES.INTRODUCTION_HOOK]: ['introduction', 'hook', 'opening'],
  [SECTION_TYPES.ACTIVITIES]: ['activit', 'main activities', 'learning activities'],
  [SECTION_TYPES.ASSESSMENT_STRATEGIES]: ['assess', 'evaluat', 'measuring'],
  [SECTION_TYPES.DIFFERENTIATION_STRATEGIES]: ['different', 'accommodat', 'modif'],
  [SECTION_TYPES.CLOSE]: ['clos', 'conclusion', 'wrap up', 'summary'],
};

// Required sections for a complete lesson plan
export const REQUIRED_SECTIONS = Object.values(SECTION_TYPES);

/**
 * Get display name for a section type
 */
export function getSectionDisplayName(sectionType: string): string {
  return SECTION_DISPLAY_NAMES[sectionType] || sectionType;
}

/**
 * Identify section type from a section title
 */
export function identifySectionType(title: string): string {
  const normalizedTitle = title.toLowerCase();
  
  for (const [sectionType, patterns] of Object.entries(SECTION_PATTERNS)) {
    if (patterns.some(pattern => normalizedTitle.includes(pattern))) {
      return sectionType;
    }
  }
  
  // If no match, return the original title
  return normalizedTitle;
}
