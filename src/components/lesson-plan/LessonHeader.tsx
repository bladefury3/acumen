
import { Button } from "@/components/ui/button";
import { Clock, GraduationCap, Share } from "lucide-react";
import { toast } from "sonner";
import { LessonPlanData } from "@/types/lesson";

interface LessonHeaderProps {
  lessonPlan: LessonPlanData;
}

const LessonHeader = ({ lessonPlan }: LessonHeaderProps) => {
  return (
    <div className="relative p-4 sm:p-6 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-3 w-full">
          <div className="flex items-start gap-2">
            <GraduationCap className="h-6 w-6 text-primary shrink-0 mt-1" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
              {lessonPlan.subject}: {lessonPlan.objectives.split('.')[0]}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="font-medium">Grade {lessonPlan.grade}</span>
            </span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lessonPlan.duration} minutes</span>
            </span>
          </div>
        </div>        
      </div>
    </div>
  );
};

export default LessonHeader;
