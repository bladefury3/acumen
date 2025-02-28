
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Instruction } from "@/types/lesson";
import { supabase } from "@/integrations/supabase/client";

interface ActivityCardProps {
  activity: Activity;
  activityId?: string;
}

const ActivityCard = ({ activity, activityId }: ActivityCardProps) => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);

  useEffect(() => {
    if (!activityId) return;

    const fetchInstructions = async () => {
      const { data, error } = await supabase
        .from('instructions')
        .select('*')
        .eq('activities_detail_id', activityId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setInstructions(data);
      }
    };

    const channel = supabase
      .channel('instructions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instructions',
          filter: `activities_detail_id=eq.${activityId}`
        },
        fetchInstructions
      )
      .subscribe();

    fetchInstructions();
    return () => { supabase.removeChannel(channel); };
  }, [activityId]);

  const getIconForActivity = (title: string) => {
    if (title.toLowerCase().includes('direct')) {
      return (
        <div className="p-2 bg-blue-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="p-2 bg-indigo-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      );
    }
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
        {getIconForActivity(activity.title)}
        <div>
          <CardTitle className="text-base sm:text-lg">{activity.title}</CardTitle>
          <CardDescription>{activity.duration}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="prose prose-sm max-w-none">
          <ul className="space-y-2 pl-5 mt-2">
            {activityId && instructions.length > 0 ? (
              instructions.map((instruction) => (
                <li key={instruction.id} className="text-sm text-gray-700">{instruction.instruction_text}</li>
              ))
            ) : (
              activity.steps.map((step, stepIdx) => (
                <li key={stepIdx} className="text-sm text-gray-700">{step}</li>
              ))
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
