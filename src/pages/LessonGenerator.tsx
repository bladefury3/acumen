
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Home, Book, Settings as SettingsIcon } from "lucide-react";

const LessonGenerator = () => {
  const [loading, setLoading] = useState(false);

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Generate Lesson",
      href: "/",
      icon: Book,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ];

  const handleGenerateLesson = async () => {
    setLoading(true);
    // Lesson generation logic would go here
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
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
