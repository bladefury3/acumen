import { Clock, GraduationCap, Calendar, Tag } from "lucide-react";
import { LessonPlanData } from "@/types/lesson";

interface LessonHeaderProps {
  lessonPlan: LessonPlanData;
}

const LessonHeader = ({ lessonPlan }: LessonHeaderProps) => {
  return (
    <div className="relative p-6 rounded-lg bg-gradient-to-r from-[#f5faff] to-[#eaf4ff] border border-transparent shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <div className="bg-[#D7E2F4] text-[#4F70C0] rounded-full p-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A3B7B]">
              {lessonPlan.subject}: {lessonPlan.objectives.split('.')[0]}
            </h1>
            <p className="text-base text-[#6C80A3]">
              A comprehensive lesson plan for introducing {lessonPlan.subject.toLowerCase()} concepts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[#4F70C0] text-sm flex-wrap mt-2">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span>Grade {lessonPlan.grade}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{lessonPlan.duration} minutes</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(lessonPlan.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{lessonPlan.subject}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;