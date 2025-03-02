
import { useState, useEffect } from "react";
import { Activity, ParsedSection } from "@/types/lesson";
import { supabase } from "@/integrations/supabase/client";
import SectionCard from "./SectionCard";
import ActivityCard from "./ActivityCard";
import { toast } from "sonner";

interface LessonSectionsProps {
  groupedSections: {
    topRow: ParsedSection[];
    introduction?: ParsedSection;
    activities?: ParsedSection;
    assessmentRow: ParsedSection[];
    close?: ParsedSection;
  };
  lessonId?: string;
}

const LessonSections = ({ groupedSections, lessonId }: LessonSectionsProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (lessonId) {
      setIsLoading(true);
      
      const fetchActivities = async () => {
        try {
          const { data, error } = await supabase
            .from('lessons')
            .select('activities')
            .eq('id', lessonId)
            .single();
            
          if (error) {
            console.error("Error fetching activities:", error);
            toast.error("Failed to load activities");
            return;
          }
          
          if (data && data.activities) {
            console.log("Loaded activities from lesson:", data.activities);
            setActivities(data.activities as Activity[]);
          }
        } catch (error) {
          console.error("Error fetching activities:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchActivities();
    } else if (groupedSections.activities && groupedSections.activities.activities) {
      // If no lessonId is provided, use the activities from the grouped sections
      setActivities(groupedSections.activities.activities);
    }
  }, [lessonId, groupedSections]);
  
  return (
    <div className="space-y-8">
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groupedSections.topRow.map((section, index) => (
          <SectionCard key={index} section={section} />
        ))}
      </div>
      
      {/* Introduction */}
      {groupedSections.introduction && (
        <SectionCard section={groupedSections.introduction} />
      )}
      
      {/* Activities */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Activities</h3>
        {isLoading ? (
          <div className="text-muted-foreground">Loading activities...</div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground">No activities found</div>
        )}
      </div>
      
      {/* Assessment row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupedSections.assessmentRow.map((section, index) => (
          <SectionCard key={index} section={section} />
        ))}
      </div>
      
      {/* Close */}
      {groupedSections.close && (
        <SectionCard section={groupedSections.close} />
      )}
    </div>
  );
};

export default LessonSections;
