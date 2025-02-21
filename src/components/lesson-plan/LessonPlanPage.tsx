
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download } from "lucide-react";

interface LessonPlanProps {
  lessonPlan: {
    title: string;
    description: string;
    pdfContent: string;
  };
  userInputControls: React.ReactNode[];
}

const LessonPlanPage = ({ lessonPlan, userInputControls }: LessonPlanProps) => {
  const sections = [
    { title: "Learning Objectives", content: "Content for learning objectives" },
    { title: "Materials and Resources", content: "Content for materials" },
    { title: "Introduction/Hook", content: "Content for introduction" },
    { title: "Main Activities", content: "Content for activities" },
    { title: "Assessment Strategies", content: "Content for assessment" },
    { title: "Differentiation Strategies", content: "Content for differentiation" },
    { title: "Closure", content: "Content for closure" },
  ];

  const handleDownloadPDF = () => {
    // PDF download logic here
    console.log("Downloading PDF...");
  };

  const handleGenerateMore = (section: string) => {
    console.log(`Generating more content for ${section}...`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">{lessonPlan.title}</h1>
          <p className="text-muted-foreground">{lessonPlan.description}</p>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* User Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson Plan Settings</CardTitle>
          <CardDescription>
            Customize your lesson plan by adjusting these settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userInputControls.map((control, index) => (
              <div key={index} className="w-full">
                {control}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Generated Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>{section.content}</p>
              </div>
              <Button 
                onClick={() => handleGenerateMore(section.title)}
                variant="secondary"
                className="w-full"
              >
                Generate More
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LessonPlanPage;
