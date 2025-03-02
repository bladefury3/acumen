
import { ParsedSection } from "@/types/lesson";
import {
  cleanMarkdown,
  extractSections,
  findSectionContent,
  identifySectionType,  
  validateParsedSections,
} from "./sectionParser";
import { extractActivitiesWithFallbacks } from "./activityParser";

/**
 * Main function to parse AI response into structured sections
 */
export const parseAIResponse = (aiResponse: string): ParsedSection[] => {
  try {
    console.log("Starting to parse AI response...");

    // Extract sections from the AI response
    const rawSections = extractSections(aiResponse);
    console.log("Raw sections extracted:", rawSections);

    if (rawSections.length === 0) {
      console.error("No valid sections found in AI response");
      console.log("Original AI response:", aiResponse);
      throw new Error("No valid sections found in AI response");
    }

    // Required sections that we need to find
    const requiredSections = new Set([
      "Learning Objectives",
      "Materials & Resources",
      "Introduction & Hook",
      "Activities",
      "Assessment Strategies",
      "Differentiation Strategies",
      "Close",
    ]);
    const foundSections = new Set<string>();
    
    // First pass - identify which required sections we already have
    for (const section of rawSections) {
      foundSections.add(section.title);
    }

    // Log found and missing sections for debugging
    console.log("Found sections:", Array.from(foundSections));
    console.log("Missing sections:", Array.from(requiredSections).filter(s => !foundSections.has(s)));

    return rawSections;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error(`Failed to parse AI response: ${(error as Error).message}`);
  }
};

/**
 * Utility function for manual testing of parser
 */
export const manualTestParsing = (aiResponse: string) => {
  try {
    console.log("Testing parseAIResponse with provided AI response...");
    const result = parseAIResponse(aiResponse);
    console.log("Successfully parsed AI response into", result.length, "sections:");

    result.forEach((section) => {
      console.log(`\nSection: ${section.title}`);
      console.log("Content items:", section.content.length);
    });

    return result;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw error;
  }
};
