
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instruction } from "@/types/lesson";
import { supabase } from "@/integrations/supabase/client";

interface ActivityCardProps {
  activityId: string;
  title: string;
  isOpen?: boolean;
}

const ActivityCard = ({ activityId, title, isOpen = false }: ActivityCardProps) => {
  const [expanded, setExpanded] = useState(isOpen);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const { data, error } = await supabase
          .from('instructions')
          .select('*')
          .eq('activities_detail_id', activityId);

        if (error) throw error;
        
        // Map the data to Instruction interface without assuming updated_at exists
        const mappedInstructions: Instruction[] = data.map(item => ({
          id: item.id,
          instruction_text: item.instruction_text,
          activities_detail_id: item.activities_detail_id,
          created_at: item.created_at,
          // Only add updated_at if it exists in the database response
          ...(item.updated_at ? { updated_at: item.updated_at } : {})
        }));
        
        setInstructions(mappedInstructions);
      } catch (error) {
        console.error('Error fetching instructions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [activityId]);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <Card className="mb-4 border border-primary/10">
      <CardHeader className="p-4 cursor-pointer" onClick={toggleExpanded}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="p-4 pt-0">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : instructions.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {instructions.map((instruction) => (
                <li key={instruction.id}>{instruction.instruction_text}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No instructions available.</p>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ActivityCard;
