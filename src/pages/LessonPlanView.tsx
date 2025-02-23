
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, Share, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonPlanData {
  id: string;
  objectives: string;
  grade: string;
  subject: string;
  fun_elements: string;
  duration: string;
  curriculum: string;
  learning_tools: string[];
  learning_needs: string[];
  activities: string[];
  assessments: string[];
  ai_response: string;
}

interface Activity {
  title: string;
  duration: string;
  steps: string[];
}

interface ParsedSection {
  title: string;
  content: string[];
  activities?: Activity[];
  generated?: boolean;
}

const LessonPlanView = () => {
  const { id } = useParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [generatingSections, setGeneratingSections] = useState<Set<string>>(new Set());

  const parseActivities = (content: string[]): Activity[] => {
    return content.map(activity => {
      const titleMatch = activity.match(/Activity\s+\d+:\s+([^(]+)\s*\((\d+)\s*minutes\)/i);
      
      if (!titleMatch) {
        // If no match found, try to extract just the title and duration
        const basicMatch = activity.match(/([^(]+)\s*\((\d+)\s*minutes\)/i);
        if (basicMatch) {
          const [_, title, duration] = basicMatch;
          const restOfContent = activity.split(')').slice(1).join(')').trim();
          const steps = restOfContent.split(/[.!?]\s+/)
            .map(step => step.trim())
            .filter(Boolean)
            .map(step => step.endsWith('.') ? step : `${step}.`);
          
          return {
            title: title.trim(),
            duration: `${duration} minutes`,
            steps
          };
        }
        return { title: activity, duration: "", steps: [] };
      }

      const [_, title, duration] = titleMatch;
      const description = activity.split(':').slice(2).join(':').trim();
      const steps = description.split(/[.!?]\s+/)
        .map(step => step.trim())
        .filter(Boolean)
        .map(step => step.endsWith('.') ? step : `${step}.`);

      return {
        title: title.trim(),
        duration: `${duration} minutes`,
        steps
      };
    });
  };

  const parseAIResponse = (aiResponse: string): ParsedSection[] => {
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;

    // Split by markdown headers (###) and process each section
    const sectionTexts = aiResponse.split(/(?=###\s)/);

    sectionTexts.forEach(sectionText => {
      const lines = sectionText.split('\n').map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) return;

      const titleLine = lines[0];
      const title = titleLine.replace('###', '').trim();
      const content = lines.slice(1)
        .filter(line => line.startsWith('-') || /^\d+\./.test(line))
        .map(line => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').trim());

      if (title.toLowerCase().includes('activities')) {
        sections.push({
          title,
          content: content,
          activities: parseActivities(content),
          generated: false
        });
      } else {
        sections.push({
          title,
          content: content,
          generated: false
        });
      }
    });

    return sections;
  };

  const handleGenerateMore = async (sectionTitle: string) => {
    if (!id || generatingSections.has(sectionTitle)) return;

    setGeneratingSections(prev => new Set([...prev, sectionTitle]));
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          prompt: `Generate 3 more ${sectionTitle.toLowerCase()} for this lesson plan that are different from the existing ones.`,
          existingContent: parsedSections.find(s => s.title === sectionTitle)?.content || []
        }
      });

      if (error) throw error;

      const newContent = data.response.split('\n')
        .filter((line: string) => line.trim().startsWith('- '))
        .map((line: string) => line.trim().replace('- ', ''));

      setParsedSections(prev => prev.map(section => {
        if (section.title === sectionTitle) {
          return {
            ...section,
            content: [...section.content, ...newContent],
            generated: true
          };
        }
        return section;
      }));

      toast.success(`Generated new ${sectionTitle.toLowerCase()}`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate new ${sectionTitle.toLowerCase()}`);
    } finally {
      setGeneratingSections(prev => {
        const next = new Set(prev);
        next.delete(sectionTitle);
        return next;
      });
    }
  };

  useEffect(() => {
    const fetchLessonPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('lesson_plans')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLessonPlan(data);
        
        if (data.ai_response) {
          console.log('AI Response:', data.ai_response); // Debug log
          const sections = parseAIResponse(data.ai_response);
          console.log('Parsed Sections:', sections); // Debug log
          setParsedSections(sections);
        }
      } catch (error) {
        console.error('Error fetching lesson plan:', error);
        toast.error("Failed to load lesson plan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchLessonPlan();
  }, [id]);

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading lesson plan...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lessonPlan) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Lesson Plan Not Found</h1>
          <Link to="/dashboard" className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
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
              {lessonPlan?.subject}: {lessonPlan?.objectives.split('.')[0]}
            </h1>
            <p className="text-muted-foreground mt-2">
              Grade {lessonPlan?.grade} • {lessonPlan?.duration} minutes
            </p>
          </div>
          <Button onClick={() => toast.info("Share functionality coming soon!")} variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share Lesson
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {parsedSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.activities ? (
                  <div className="grid grid-cols-1 gap-6">
                    {section.activities.map((activity, idx) => (
                      <Card key={idx} className="bg-accent/50">
                        <CardHeader>
                          <CardTitle>{activity.title}</CardTitle>
                          <CardDescription>{activity.duration}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <h3 className="text-sm font-medium mb-2">Instructions:</h3>
                            <ul className="list-decimal pl-4 space-y-2">
                              {activity.steps.map((step, stepIdx) => (
                                <li key={stepIdx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ul className="list-disc pl-4 space-y-2">
                      {section.content.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!section.generated && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleGenerateMore(section.title)}
                    disabled={generatingSections.has(section.title)}
                  >
                    {generatingSections.has(section.title) ? 'Generating...' : 'Generate More'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlanView;

