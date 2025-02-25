
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const LessonBreadcrumb = () => {
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        Dashboard
      </Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      <span className="text-foreground">Lesson Plan</span>
    </div>
  );
};

export default LessonBreadcrumb;
