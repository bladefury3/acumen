
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Share } from "lucide-react";
import { toast } from "sonner";
import { LessonPlanData } from "@/types/lesson";

interface LessonHeaderProps {
  lessonPlan: LessonPlanData;
}

const LessonHeader = ({ lessonPlan }: LessonHeaderProps) => {
  return (
    <div className="relative p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              {lessonPlan.subject}: {lessonPlan.objectives.split('.')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="font-medium">Grade {lessonPlan.grade}</span>
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lessonPlan.duration} minutes</span>
            </span>
          </div>
        </div>
        <Button 
          onClick={() => toast.info("Share functionality coming soon!")} 
          variant="outline"
          className="hover:bg-white/50 transition-colors"
        >
          <Share className="mr-2 h-4 w-4" />
          Share Lesson
        </Button>
      </div>
    </div>
  );
};

export default LessonHeader;
