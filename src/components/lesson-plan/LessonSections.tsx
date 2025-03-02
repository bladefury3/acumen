
import React, { useEffect, useState, lazy, Suspense } from 'react';
import SectionCard from './SectionCard';
import { supabase } from '@/integrations/supabase/client';
import { SECTION_DISPLAY_NAMES } from '@/services/parser/constants/sections';

interface LessonSectionsProps {
  lessonId: string;
}

interface LessonData {
  id: string;
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: string;
  response_id: string;
}

// Lazy load ActivityCard to optimize performance
const ActivityCard = lazy(() => import('./ActivityCard'));

const LessonSections: React.FC<LessonSectionsProps> = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('response_id', lessonId)
          .single();

        if (error) throw error;

        console.log('Fetched lesson data:', data);
        setLessonData(data);
      } catch (err) {
        console.error('Error fetching lesson sections:', err);
        setError('Failed to load lesson sections');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonData();
    }
  }, [lessonId]);

  if (loading) return <div className="text-center py-8">Loading lesson sections...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!lessonData) return <div className="text-center py-8">No lesson data found.</div>;

  // Enhanced content processing to handle different markdown formats
  const processContent = (content: string): string[] => {
    if (!content || content.trim() === '' || content === '-') return [];

    // Improved check for markdown content
    const hasMarkdownFormatting =
      content.includes('#') ||
      content.includes('*') ||
      content.includes('_') ||
      content.includes('```') ||
      content.includes('- ') ||
      content.includes('• ') ||
      content.includes('1.') ||
      content.includes(':');

    // If it has markdown formatting, properly format as markdown
    if (hasMarkdownFormatting) {
      // Check if it's a list of bullet points or paragraphs
      if (content.includes('- ') || content.includes('* ') || content.includes('• ') || content.includes('1.')) {
        // Check if it looks like multiple activities with headings
        if ((content.includes('### Activity') || content.includes('Activity 1:')) && 
            (content.includes('Activity 2:') || content.includes('### Activity 2'))) {
          // This is likely a formatted activities section, return as is
          return [content];
        }
        
        // Extract individual items if it's a standard list
        const listItems = content.split(/\n(?=[-*•\d])/g)
          .filter(item => item.trim().length > 0)
          .map(item => item.trim());

        if (listItems.length > 1) {
          return listItems;
        }
        
        // Try to extract numbered lists (e.g., "1. Item")
        const numberedItems = content.split(/\n(?=\d+\.)/g)
          .filter(item => item.trim().length > 0)
          .map(item => item.trim());
          
        if (numberedItems.length > 1) {
          return numberedItems;
        }
        
        // If we can't parse as a list, return as markdown
        return [content];
      }
      
      // Check for section headers inside markdown
      if (content.includes('**Part') || content.includes('## Part') || 
          content.includes('###') || content.includes('**1.')) {
        return [content];
      }
      
      // Check for lines with headings or emphasized text
      if (content.includes('**') || content.includes('##')) {
        // Split by paragraphs for better readability
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        if (paragraphs.length > 1) {
          return [content]; // Return as full markdown if we have multiple paragraphs
        }
      }
      
      // Split by newlines and filter empty lines, looking for potential sentence breaks
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      
      if (lines.length > 1) {
        // Check if lines look like a list
        const looksLikeList = lines.some(line => 
          line.trim().startsWith('-') || 
          line.trim().startsWith('*') || 
          /^\d+\./.test(line.trim())
        );
        
        if (looksLikeList) {
          return lines;
        } else {
          // Combine lines back to a single markdown block
          return [content];
        }
      }
      
      return [content];
    }

    // Split content by newlines and filter empty lines
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // If content is all in one line, check for patterns that suggest it should be split
    if (lines.length <= 1 && content.trim().length > 0) {
      // Try to split by bullet points, numbers, or sentences
      const items = content.split(/(?:(?:\r?\n)|(?:\r?\n?[•\-\*]\s+)|(?:\d+\.\s+))/).filter(item => item.trim().length > 0);
      
      if (items.length > 1) {
        return items.map(item => item.trim());
      }
      
      // Try to split by sentences for better readability
      const sentences = content.split(/(?<=\.)(?=\s+[A-Z])/).filter(s => s.trim().length > 0);
      
      if (sentences.length > 1) {
        return sentences.map(s => s.trim());
      }
      
      return [content.trim()];
    }

    return lines;
  };

  // Process the activities section specifically for the special ActivityCard handling
  const processActivitiesSection = (content: string): string => {
    if (!content || content.trim() === '' || content === '-') return '';
    
    // If it already has markdown formatting with activity headings, return as is
    if (content.includes('### Activity') || 
        (content.includes('Activity 1:') && content.includes('Activity 2:'))) {
      return content;
    }
    
    // Try to extract and format activities
    const activityRegex = /(?:Activity\s+\d+:|(?:\d+\.)\s+(?:[A-Z][^:]*):)([^]*?)(?=(?:Activity\s+\d+:|(?:\d+\.)\s+[A-Z].*:|\Z))/gi;
    const matches = Array.from(content.matchAll(activityRegex));
    
    if (matches.length > 0) {
      return matches.map((match, index) => {
        const activityTitle = match[0].split(':')[0].trim();
        const activityContent = match[1].trim();
        return `### ${activityTitle}\n${activityContent}`;
      }).join('\n\n');
    }
    
    // If we couldn't extract activities, return as is
    return content;
  };

  // Define a consistent order for sections
  const sectionOrder = [
    'learning_objectives',
    'materials_resources',
    'introduction_hook',
    'activities',
    'assessment_strategies',
    'differentiation_strategies',
    'close'
  ];

  return (
    <div className="space-y-8">
      {sectionOrder.map(sectionType => {
        // Get display name from our constants
        const displayName = SECTION_DISPLAY_NAMES[sectionType] ||
          sectionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Get the raw content
        const rawContent = lessonData[sectionType as keyof LessonData] as string;
        
        // Only render if we have content and it's not just a placeholder
        if (!rawContent || rawContent.trim() === '' || rawContent === '-') {
          return null;
        }

        // Process content based on section type
        if (sectionType === 'activities') {
          const processedActivities = processActivitiesSection(rawContent);
          if (!processedActivities) return null;
          
          return (
            <Suspense key={sectionType} fallback={<div>Loading activities...</div>}>
              <ActivityCard 
                title={displayName} 
                content={[processedActivities]} 
              />
            </Suspense>
          );
        }
        
        // Format content for other sections
        const content = processContent(rawContent);
        if (!content || content.length === 0) return null;

        return (
          <SectionCard 
            key={sectionType}
            title={displayName} 
            content={content} 
          />
        );
      })}
    </div>
  );
};

export default LessonSections;
