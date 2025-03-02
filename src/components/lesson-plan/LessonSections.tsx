
import React, { useEffect, useState } from 'react';
import SectionCard from './SectionCard';
import ActivityCard from './ActivityCard';
import { supabase } from '@/integrations/supabase/client';

interface LessonSectionsProps {
  lessonId: string;
}

const LessonSections: React.FC<LessonSectionsProps> = ({ lessonId }) => {
  const [lessonData, setLessonData] = useState<any>(null);
  const [activitiesContent, setActivitiesContent] = useState<string>('');
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
        
        setLessonData(data);
        // Store activities as string content for display
        if (data.activities) {
          setActivitiesContent(data.activities);
        }
        
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

  return (
    <div className="space-y-8">
      <SectionCard
        title="Learning Objectives"
        content={lessonData.learning_objectives ? lessonData.learning_objectives.split('\n').filter((line: string) => line.trim().length > 0) : []}
      />
      
      <SectionCard
        title="Materials & Resources"
        content={lessonData.materials_resources ? lessonData.materials_resources.split('\n').filter((line: string) => line.trim().length > 0) : []}
      />
      
      <SectionCard
        title="Introduction & Hook"
        content={lessonData.introduction_hook ? lessonData.introduction_hook.split('\n').filter((line: string) => line.trim().length > 0) : []}
      />
      
      <ActivityCard 
        title="Activities"
        content={activitiesContent}
      />
      
      <SectionCard
        title="Assessment Strategies"
        content={lessonData.assessment_strategies ? lessonData.assessment_strategies.split('\n').filter((line: string) => line.trim().length > 0) : []}
      />
      
      <SectionCard
        title="Differentiation Strategies"
        content={lessonData.differentiation_strategies ? lessonData.differentiation_strategies.split('\n').filter((line: string) => line.trim().length > 0) : []}
      />
      
      <SectionCard
        title="Close"
        content={lessonData.close ? lessonData.close.split('\n').filter((line: string) => line.trim().length > 0) : []}
      />
    </div>
  );
};

export default LessonSections;
