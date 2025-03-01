
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleCopyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => toast.success("Resources copied to clipboard"))
        .catch(err => toast.error("Failed to copy: " + err));
    }
  };

  const handleDownload = () => {
    if (content) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lesson-resources.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Resources downloaded");
    }
  };

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
      <CardFooter className="px-6 py-3 bg-muted/20 flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyToClipboard}
          className="flex items-center gap-1"
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResourcesCard;
