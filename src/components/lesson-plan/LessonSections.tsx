
import React, { useEffect, useState } from 'react';
import SectionCard from './SectionCard';
import ActivityCard from './ActivityCard';
import { supabase } from '@/integrations/supabase/client';

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

  // Helper function to split content by newlines and filter empty lines
  const formatContentToArray = (content: string): string[] => {
    if (!content) return [];
    
    // First try splitting by newlines
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // If we got no lines but have content, it might be all in one line
    // Try to split by bullets or numbered items
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

  return (
    <div className="space-y-8">
      <SectionCard
        title="Learning Objectives"
        content={formatContentToArray(lessonData.learning_objectives)}
      />
      
      <SectionCard
        title="Materials & Resources"
        content={formatContentToArray(lessonData.materials_resources)}
      />
      
      <SectionCard
        title="Introduction & Hook"
        content={formatContentToArray(lessonData.introduction_hook)}
      />
      
      <ActivityCard 
        title="Activities"
        content={formatContentToArray(lessonData.activities)}
      />
      
      <SectionCard
        title="Assessment Strategies"
        content={formatContentToArray(lessonData.assessment_strategies)}
      />
      
      <SectionCard
        title="Differentiation Strategies"
        content={formatContentToArray(lessonData.differentiation_strategies)}
      />
      
      <SectionCard
        title="Close"
        content={formatContentToArray(lessonData.close)}
      />
    </div>
  );
};

export default LessonSections;
