
import { Button } from "@/components/ui/button";
import { Calendar, Clock, GraduationCap, Share, Tag } from "lucide-react";
import { toast } from "sonner";
import { LessonPlanData } from "@/types/lesson";

interface LessonHeaderProps {
  lessonPlan: LessonPlanData;
}

const LessonHeader = ({ lessonPlan }: LessonHeaderProps) => {
  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Extract the main title from objectives (first sentence)
  const mainTitle = lessonPlan.objectives.split('.')[0];
  
  // For demo purposes, using a fixed date. In a real app, this would come from the database
  const lessonDate = "September 15, 2025";
  
  return (
    <div className="relative p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
      <div className="flex flex-col space-y-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">
              {lessonPlan.subject}: {mainTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              A comprehensive lesson plan for introducing circle geometry concepts
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2"
            onClick={handleShareClick}
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
        
        {/* Metadata Row */}
        <div className="flex flex-wrap gap-6 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Grade {lessonPlan.grade}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{lessonPlan.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{lessonDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4 text-primary" />
            <span>{lessonPlan.subject}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
