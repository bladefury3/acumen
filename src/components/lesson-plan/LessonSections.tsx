
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
    if (!content) return [];

    // Improved check for markdown content
    const hasMarkdownFormatting =
      content.includes('#') ||
      content.includes('*') ||
      content.includes('_') ||
      content.includes('```') ||
      content.includes('- ');

    // If it has markdown formatting, properly format as markdown
    if (hasMarkdownFormatting) {
      // Check if it's a list of bullet points or paragraphs
      if (content.includes('- ') || content.includes('* ')) {
        // Return as markdown list directly
        return [content];
      }
      
      // Check for section headers inside markdown
      if (content.includes('**Part') || content.includes('## Part')) {
        return [content];
      }
      
      // Split by paragraphs for better readability
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      if (paragraphs.length > 1) {
        return [content]; // Return as full markdown if we have multiple paragraphs
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

        // Get and format content
        const content = processContent(lessonData[sectionType as keyof LessonData] as string);

        // Only render if we have content
        if (!content || content.length === 0) return null;

        // Choose the correct component
        const CardComponent = sectionType === 'activities' ? ActivityCard : SectionCard;

        return (
          <Suspense key={sectionType} fallback={<div>Loading...</div>}>
            <CardComponent title={displayName} content={content} />
          </Suspense>
        );
      })}
    </div>
  );
};

export default LessonSections;
