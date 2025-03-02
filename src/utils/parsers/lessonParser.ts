
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

    if (rawSections.length === 0) {
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
    const sections: ParsedSection[] = [];

    // Process each extracted section
    for (const rawSection of rawSections) {
      const sectionTitle = identifySectionType(rawSection.title);
      const contentLines = (typeof rawSection.content === "string" ? rawSection.content : "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      // Default section processing (including Activities section)
      sections.push({
        title: sectionTitle,
        content: contentLines,
        generated: false,
      });
      foundSections.add(sectionTitle);
    }

    // Check for missing required sections
    const missingSections = Array.from(requiredSections).filter(
      (section) => !foundSections.has(section)
    );

    if (missingSections.length > 0) {
      console.warn(`Missing sections: ${missingSections.join(", ")}`);

      // If there are still missing sections, try to generate them from the content
      for (const missingSection of missingSections) {
        console.log(`Generating missing section: ${missingSection}`);
        sections.push({
          title: missingSection,
          content: [`Auto-generated ${missingSection.toLowerCase()} section`],
          generated: true,
        });
      }
    }

    return sections;
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
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
