
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Lesson Plan Not Found</h1>
      <p className="text-gray-600 mb-6">
        We couldn't find the lesson plan you're looking for. It may have been deleted or you might not have permission to view it.
      </p>
      <Button asChild className="bg-[#003C5A] hover:bg-[#003C5A]/90 text-white">
        <Link to="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFoundState;
