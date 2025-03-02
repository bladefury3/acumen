
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
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ActivityCardProps {
  activity: Activity;
  activityId?: string;
}

const ActivityCard = ({ activity, activityId }: ActivityCardProps) => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!activityId) return;

    const fetchInstructions = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('instructions')
          .select('*')
          .eq('activities_detail_id', activityId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching instructions:", error);
          toast.error("Failed to load activity instructions");
          return;
        }

        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} instructions for activity ID ${activityId}`);
          setInstructions(data);
        } else {
          console.log(`No instructions found for activity ID ${activityId}`);
        }
      } catch (error) {
        console.error("Exception fetching instructions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up real-time subscription for changes to instructions
    const channel = supabase
      .channel(`instructions-changes-${activityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instructions',
          filter: `activities_detail_id=eq.${activityId}`
        },
        (payload) => {
          console.log("Realtime update for instructions:", payload);
          fetchInstructions();
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for activity ${activityId}:`, status);
      });

    // Initial fetch
    fetchInstructions();
    
    // Cleanup function
    return () => { 
      console.log(`Cleaning up subscription for activity ${activityId}`);
      supabase.removeChannel(channel); 
    };
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
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading instructions...</div>
          ) : (
            <ul className="list-disc pl-4 space-y-2 text-sm">
              {activityId && instructions.length > 0 ? (
                instructions.map((instruction) => (
                  <li key={instruction.id} className="leading-relaxed">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {instruction.instruction_text}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))
              ) : (
                activity.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="leading-relaxed">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {step}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
