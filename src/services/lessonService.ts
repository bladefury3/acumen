
import { ParsedSection } from "@/types/lesson";
import { parseAIResponse } from "@/utils/lessonParser";
import { toast } from "sonner";
import { findSectionContent, validateParsedSections, findActivitiesSection } from "./lesson/sectionParser";
import { cleanExistingLessonData, createNewLesson, createActivities } from "./lesson/databaseOperations";
import { ParsedLesson } from "./lesson/types";

export const parseAndStoreAIResponse = async (aiResponse: string, responseId: string): Promise<ParsedSection[]> => {
  try {
    // Parse AI response into sections
    const parsedSections = parseAIResponse(aiResponse);
    if (!parsedSections || parsedSections.length === 0) {
      throw new Error("Failed to parse AI response");
    }

    // Extract content for each section
    const learningObjectives = findSectionContent(parsedSections, [
      "learning objectives",
      "objectives",
    ]);
    const materialsResources = findSectionContent(parsedSections, [
      "materials",
      "resources",
    ]);
    const introductionHook = findSectionContent(parsedSections, [
      "introduction",
      "hook",
    ]);
    const assessmentStrategies = findSectionContent(parsedSections, [
      "assessment",
      "evaluate",
    ]);
    const differentiationStrategies = findSectionContent(parsedSections, [
      "differentiation",
      "differentiated",
    ]);
    const close = findSectionContent(parsedSections, ["close", "closure", "conclusion"]);

    // Validate parsed sections
    const parsedLesson: Omit<ParsedLesson, "activities"> = {
      learning_objectives: learningObjectives,
      materials_resources: materialsResources,
      introduction_hook: introductionHook,
      assessment_strategies: assessmentStrategies,
      differentiation_strategies: differentiationStrategies,
      close: close,
    };

    try {
      validateParsedSections(parsedLesson);
    } catch (error: any) {
      console.error("Validation error:", error.message);
      // Continue anyway, but log the error
    }

    // Find activities section
    const activitiesSection = findActivitiesSection(parsedSections);
    const activities = activitiesSection?.activities || [];

    // Clean existing data from database
    await cleanExistingLessonData(responseId);

    // Create new lesson
    const parsedLessonWithActivities: ParsedLesson = {
      ...parsedLesson,
      activities: activities.map((act) => ({
        activity_name: act.title,
        description: act.duration,
        instructions: act.steps.join("\n"),
      })),
    };

    const newLesson = await createNewLesson(responseId, parsedLessonWithActivities);

    // Create activities
    if (parsedLessonWithActivities.activities.length > 0) {
      await createActivities(responseId, parsedLessonWithActivities.activities);
    }

    return parsedSections;
  } catch (error) {
    console.error("Error in parseAndStoreAIResponse:", error);
    toast.error("Failed to process lesson plan data");
    return [];
  }
};
