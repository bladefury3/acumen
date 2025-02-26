
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <Card className="bg-accent/50">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base sm:text-lg">{activity.title}</CardTitle>
        <CardDescription>{activity.duration}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="prose prose-sm max-w-none">
          <h3 className="text-sm font-medium mb-2">Instructions:</h3>
          <ul className="list-decimal pl-4 space-y-2 text-sm">
            {activityId && instructions.length > 0 ? (
              instructions.map((instruction) => (
                <li key={instruction.id}>{instruction.instruction_text}</li>
              ))
            ) : (
              activity.steps.map((step, stepIdx) => (
                <li key={stepIdx}>{step}</li>
              ))
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
