
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ResourcesCardProps {
  lessonPlanId: string;
  resourcesId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const ResourcesCard = ({ 
  lessonPlanId, 
  resourcesId,
  onLoadingChange
}: ResourcesCardProps) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      setError(null);

      try {
        let id = resourcesId;

        // If no resourcesId is provided, try to fetch it
        if (!id) {
          const { data, error } = await supabase
            .rpc('get_lesson_resources_by_lesson_id', { p_lesson_plan_id: lessonPlanId });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            id = data[0].id;
          } else {
            throw new Error('No resources found for this lesson plan');
          }
        }

        // Fetch the content using the resource ID
        const { data, error } = await supabase
          .from('lesson_resources')
          .select('content')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setError(error.message || 'Failed to load resources');
      } finally {
        setIsLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    if (lessonPlanId) {
      fetchResources();
    }
  }, [lessonPlanId, resourcesId, onLoadingChange]);

  if (isLoading) {
    return (
      <Card className="w-full p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#003C5A]" />
        <p className="ml-2">Loading resources...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">
            <p>{error}</p>
            <p className="mt-2">Please try generating resources again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesCard;
