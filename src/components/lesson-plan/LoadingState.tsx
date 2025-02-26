
import { FileText, Settings } from "lucide-react";

const LoadingState = () => {
  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center space-x-4">
        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading lesson plan...</p>
      </div>
    </div>
  );
};

export default LoadingState;
