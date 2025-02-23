
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
import { cn } from "@/lib/utils";

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
      // Match "Activity X: Title (duration)" pattern
      const titleMatch = activity.match(/Activity\s+\d+:\s+([^(]+)\s*\((\d+)\s*minutes\)/i);
      if (!titleMatch) return { title: activity, duration: "", steps: [] };

      const [_, title, duration] = titleMatch;
      
      // Split the remaining content into steps
      const description = activity.split(':').slice(2).join(':').trim();
      const steps = description.split(/\.\s+/)
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
    const lines = aiResponse.split('\n');
    let currentSection: ParsedSection | null = null;

    lines.forEach(line => {
      if (line.startsWith('### ')) {
        if (currentSection) {
          if (currentSection.title.toLowerCase().includes('activities')) {
            currentSection.activities = parseActivities(currentSection.content);
          }
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('### ', '').trim(),
          content: [],
          generated: false
        };
      }
      else if (line.trim().startsWith('- ') && currentSection) {
        currentSection.content.push(line.trim().replace('- ', ''));
      }
      else if (/^\d+\.\s/.test(line.trim()) && currentSection) {
        currentSection.content.push(line.trim());
      }
    });

    if (currentSection) {
      if (currentSection.title.toLowerCase().includes('activities')) {
        currentSection.activities = parseActivities(currentSection.content);
      }
      sections.push(currentSection);
    }

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
          const sections = parseAIResponse(data.ai_response);
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

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className="mb-2">{line}</p>
    ));
  };

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
                <CardTitle as="h2">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.activities ? (
                  <div className="grid grid-cols-1 gap-6">
                    {section.activities.map((activity, idx) => (
                      <Card key={idx} className="bg-accent/50">
                        <CardHeader>
                          <CardTitle as="h2">Activity {idx + 1}: {activity.title}</CardTitle>
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
                        <li key={idx}>{renderMarkdown(item)}</li>
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
