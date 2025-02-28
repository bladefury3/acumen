
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Download, GraduationCap, Share } from "lucide-react";
import { toast } from "sonner";
import { LessonPlanData } from "@/types/lesson";
import { format } from "date-fns";

interface LessonHeaderProps {
  lessonPlan: LessonPlanData;
  onDownload: () => void;
}

const LessonHeader = ({ lessonPlan, onDownload }: LessonHeaderProps) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Format creation date
  const creationDate = new Date();
  const formattedDate = format(creationDate, "MMMM d, yyyy");

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <a href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </a>
          <span>/</span>
          <span className="text-foreground">Lesson Plan</span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          
          <Button 
            size="sm" 
            className="flex items-center gap-2 bg-[#003C5A] text-white hover:bg-[#003C5A]/90"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-[#003C5A]/10 rounded-full p-3">
            <GraduationCap className="h-6 w-6 text-[#003C5A]" />
          </div>
          
          <div className="space-y-2 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {lessonPlan.subject}: {lessonPlan.objectives?.split('.')[0]}
            </h1>
            <p className="text-gray-600">
              A comprehensive lesson plan for introducing {lessonPlan.subject.toLowerCase()} concepts
            </p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <GraduationCap className="mr-2 h-4 w-4 text-[#003C5A]" />
                Grade {lessonPlan.grade}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-2 h-4 w-4 text-[#003C5A]" />
                {lessonPlan.duration} minutes
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4 text-[#003C5A]" />
                {formattedDate}
              </div>
              
              <div className="flex items-center text-sm">
                <span className="px-2 py-1 bg-[#003C5A]/10 text-[#003C5A] rounded-full">
                  {lessonPlan.subject}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
