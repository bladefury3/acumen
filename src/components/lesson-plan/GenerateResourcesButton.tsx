
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FilePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GenerateResourcesButtonProps {
  lessonPlanId: string;
  onResourcesGenerated: (resourcesId: string) => void;
  disabled?: boolean;
}

const GenerateResourcesButton = ({ 
  lessonPlanId,
  onResourcesGenerated,
  disabled = false 
}: GenerateResourcesButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateResources = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    toast.info("Starting to generate resources. This may take up to a minute.");

    try {
      // First check if resources already exist using custom RPC function
      const { data: existingResources, error: existingError } = await supabase
        .rpc('get_lesson_resources_by_lesson_id', { p_lesson_plan_id: lessonPlanId });

      if (existingError) {
        console.error("Error checking for existing resources:", existingError);
        toast.error("Error checking for existing resources.");
      } else if (existingResources && existingResources.length > 0) {
        toast.success("Resources already exist for this lesson plan");
        onResourcesGenerated(existingResources[0].id);
        setIsGenerating(false);
        return;
      }

      // Call the edge function to generate resources
      const { data, error } = await supabase.functions.invoke('generate-resources', {
        body: { lessonPlanId }
      });

      if (error) {
        console.error("Error generating resources:", error);
        toast.error("Failed to generate resources. Please try again later.");
        setIsGenerating(false);
        return;
      }

      if (data.success && data.resources) {
        toast.success("Resources generated successfully!");
        onResourcesGenerated(data.resources.id);
      } else {
        toast.error("Failed to generate resources. Please try again later.");
      }
    } catch (error) {
      console.error("Error in generate resources:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateResources}
      disabled={disabled || isGenerating}
      variant="secondary"
      className="flex items-center gap-2 bg-[#003C5A] text-[#C3CFF5] hover:bg-[#003C5A]/90 hover:text-[#C3CFF5]"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FilePlus className="h-4 w-4" />
      )}
      {isGenerating ? "Generating Resources..." : "Generate Resources"}
    </Button>
  );
};

export default GenerateResourcesButton;
