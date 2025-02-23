
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface LessonHeaderProps {
  subject: string;
  objective: string;
  grade: string;
  duration: string;
}

const LessonHeader = ({ subject, objective, grade, duration }: LessonHeaderProps) => {
  return (
    <>
      <div className="flex items-center text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">Lesson Plan</span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {subject}: {objective}
          </h1>
          <p className="text-muted-foreground mt-2">
            Grade {grade} • {duration} minutes
          </p>
        </div>
        <Button onClick={() => toast.info("Share functionality coming soon!")} variant="outline">
          <Share className="mr-2 h-4 w-4" />
          Share Lesson
        </Button>
      </div>
    </>
  );
};

export default LessonHeader;
