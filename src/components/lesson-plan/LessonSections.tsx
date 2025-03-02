import React, { useEffect, useState } from 'react';
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

  // Helper function to process markdown content
  const processContent = (content: string): string[] => {
    if (!content) return [];
    
    // Check if content is already in markdown format
    const hasMarkdownFormatting = 
      content.includes('#') || 
      content.includes('*') || 
      content.includes('_') ||
      content.includes('```');
    
    // If it has markdown formatting, return it as a single item
    if (hasMarkdownFormatting) {
      return [content];
    }
    
    // Otherwise split by newlines and filter empty lines
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // If we got no lines but have content, it might be all in one line
    if (lines.length === 0 && content.trim().length > 0) {
      // Try to split by bullet points or numbers at the beginning of text
      const bulletItems = content.split(/(?:^|\n)(?:\-|\*|\d+\.)\s+/g)
        .filter(item => item.trim().length > 0);
      
      if (bulletItems.length > 0) {
        return bulletItems.map(item => `- ${item.trim()}`);
      }
      
      // If still no items, just return the content as a single item
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
        
        // Format content
        const content = processContent(lessonData[sectionType as keyof LessonData] as string);
        
        // Only render if we have content
        if (!content || content.length === 0) return null;
        
        // Use ActivityCard for activities section, SectionCard for others
        const CardComponent = sectionType === 'activities' 
          ? require('./ActivityCard').default 
          : SectionCard;
        
        return (
          <CardComponent
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
