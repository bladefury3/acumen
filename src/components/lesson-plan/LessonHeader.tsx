import { Clock, GraduationCap } from "lucide-react";
import { LessonPlanData } from "@/types/lesson";
interface LessonHeaderProps {
  lessonPlan: LessonPlanData;
}
const LessonHeader = ({
  lessonPlan
}: LessonHeaderProps) => {
  return <div className="relative p-6 rounded-lg bg-gradient-to-r from-[#f5f9ff] to-[#eaf2ff]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2">
          <GraduationCap className="h-12 w-12 text-primary shrink-0 rounded-xs p-1 bg-indigo-100" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {lessonPlan.subject}
            </h1>
            <p className="text-lg text-muted-foreground">
              {lessonPlan.objectives.split('.')[0]}
            </p>
          </div>
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
    </div>;
};
export default LessonHeader;