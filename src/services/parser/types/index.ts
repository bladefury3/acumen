
/**
 * Type definitions for the parser module
 */

// Basic section shape
export interface Section {
  type: string;
  title: string;
  content: string[];
  rawContent?: string;
}

// Structure for the complete parsed lesson
export interface ParsedLessonContent {
  sections: Section[];
  missingTypes: string[];
}

// Extracted section from markdown/text
export interface ExtractedSection {
  title: string;
  content: string[];
  startIndex: number;
  endIndex: number;
}

// Error types for parser operations
export enum ParserErrorType {
  NO_CONTENT = 'NO_CONTENT',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_SECTIONS = 'MISSING_SECTIONS',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
}

// Parser error
export class ParserError extends Error {
  type: ParserErrorType;
  details?: any;

  constructor(type: ParserErrorType, message: string, details?: any) {
    super(message);
    this.type = type;
    this.details = details;
    this.name = 'ParserError';
  }
}
