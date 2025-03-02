
import React, { useEffect, useState } from 'react';
import { Activity } from '@/types/lesson';
import SectionCard from './SectionCard';
import ActivityCard from './ActivityCard';
import { supabase } from '@/integrations/supabase/client';
import { parseActivities } from '@/utils/parsers/activityParser';

const LessonSections = ({ lessonId }: { lessonId: string }) => {
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
        content={lessonData.learning_objectives}
      />
      
      <SectionCard
        title="Materials & Resources"
        content={lessonData.materials_resources}
      />
      
      <SectionCard
        title="Introduction & Hook"
        content={lessonData.introduction_hook}
      />
      
      <ActivityCard 
        title="Activities"
        content={activitiesContent}
      />
      
      <SectionCard
        title="Assessment Strategies"
        content={lessonData.assessment_strategies}
      />
      
      <SectionCard
        title="Differentiation Strategies"
        content={lessonData.differentiation_strategies}
      />
      
      <SectionCard
        title="Close"
        content={lessonData.close}
      />
    </div>
  );
};

export default LessonSections;
