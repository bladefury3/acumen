
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";

const LessonGenerator = () => {
  const [loading, setLoading] = useState(false);

  const handleGenerateLesson = async () => {
    setLoading(true);
    // Lesson generation logic would go here
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="container px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Generate New Lesson</h1>
        <Button 
          onClick={handleGenerateLesson}
          disabled={loading}
          className="bg-[#003C5A] text-[#C3CFF5] hover:bg-[#003C5A]/90"
        >
          {loading ? "Generating..." : "Generate Lesson"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default LessonGenerator;
