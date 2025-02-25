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

interface ParsedLesson {
  learning_objectives: string;
  materials_resources: string;
  introduction_hook: string;
  assessment_strategies: string;
  differentiation_strategies: string;
  close: string;
  activities: {
    activity_name: string;
    description: string;
    instructions: string;
  }[];
}

const LessonPlanView = () => {
  const { id } = useParams();
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [generatingSections, setGeneratingSections] = useState<Set<string>>(new Set());

  const parseAndStoreAIResponse = async (aiResponse: string, responseId: string) => {
    try {
      const sections = parseAIResponse(aiResponse);
      console.log('Parsed sections:', sections);

      const parsedLesson: ParsedLesson = {
        learning_objectives: sections.find(s => s.title.toLowerCase().includes('learning objectives'))?.content.join('\n') || '',
        materials_resources: sections.find(s => s.title.toLowerCase().includes('materials'))?.content.join('\n') || '',
        introduction_hook: sections.find(s => s.title.toLowerCase().includes('introduction'))?.content.join('\n') || '',
        assessment_strategies: sections.find(s => s.title.toLowerCase().includes('assessment'))?.content.join('\n') || '',
        differentiation_strategies: sections.find(s => s.title.toLowerCase().includes('differentiation'))?.content.join('\n') || '',
        close: sections.find(s => s.title.toLowerCase().includes('close'))?.content.join('\n') || '',
        activities: []
      };

      if (!parsedLesson.learning_objectives || !parsedLesson.materials_resources || 
          !parsedLesson.introduction_hook || !parsedLesson.assessment_strategies || 
          !parsedLesson.differentiation_strategies || !parsedLesson.close) {
        throw new Error('Missing required fields in lesson plan');
      }

      const activitiesSection = sections.find(s => s.title.toLowerCase().includes('activities'));
      if (activitiesSection?.activities) {
        parsedLesson.activities = activitiesSection.activities.map(activity => ({
          activity_name: activity.title || 'Untitled Activity',
          description: activity.duration || 'No duration specified',
          instructions: activity.steps?.join('\n') || 'No instructions provided'
        }));
      }

      const { data: existingLesson } = await supabase
        .from('lessons')
        .select('id')
        .eq('response_id', responseId)
        .maybeSingle();

      let lessonId;

      if (existingLesson?.id) {
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            learning_objectives: parsedLesson.learning_objectives,
            materials_resources: parsedLesson.materials_resources,
            introduction_hook: parsedLesson.introduction_hook,
            assessment_strategies: parsedLesson.assessment_strategies,
            differentiation_strategies: parsedLesson.differentiation_strategies,
            close: parsedLesson.close
          })
          .eq('id', existingLesson.id);

        if (updateError) throw updateError;
        lessonId = existingLesson.id;

        const { error: deleteError } = await supabase
          .from('activities_detail')
          .delete()
          .eq('lesson_id', lessonId);

        if (deleteError) throw deleteError;
      } else {
        const { data: newLesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            response_id: responseId,
            learning_objectives: parsedLesson.learning_objectives,
            materials_resources: parsedLesson.materials_resources,
            introduction_hook: parsedLesson.introduction_hook,
            assessment_strategies: parsedLesson.assessment_strategies,
            differentiation_strategies: parsedLesson.differentiation_strategies,
            close: parsedLesson.close
          })
          .select('id')
          .single();

        if (lessonError) throw lessonError;
        lessonId = newLesson.id;
      }

      if (parsedLesson.activities.length > 0) {
        const activitiesWithLessonId = parsedLesson.activities.map(activity => ({
          lesson_id: lessonId,
          activity_name: activity.activity_name,
          description: activity.description,
          instructions: activity.instructions
        }));

        const { error: activitiesError } = await supabase
          .from('activities_detail')
          .insert(activitiesWithLessonId);

        if (activitiesError) throw activitiesError;
      }

      setParsedSections(sections);
      toast.success('Lesson plan parsed and stored successfully');
    } catch (error) {
      console.error('Error parsing and storing AI response:', error);
      toast.error('Failed to parse and store lesson plan');
    }
  };

  const parseExistingLessonPlans = async () => {
    try {
      const { data: lessonPlans, error } = await supabase
        .from('lesson_plans')
        .select('id, ai_response')
        .is('ai_response', 'not.null');

      if (error) throw error;

      for (const plan of lessonPlans) {
        if (plan.ai_response) {
          await parseAndStoreAIResponse(plan.ai_response, plan.id);
        }
      }

      toast.success('Successfully parsed all existing lesson plans');
    } catch (error) {
      console.error('Error parsing existing lesson plans:', error);
      toast.error('Failed to parse some existing lesson plans');
    }
  };

  const parseActivities = (content: string[]): Activity[] => {
    return content.map(activity => {
      const titleMatch = activity.match(/Activity\s+\d+:\s+([^(]+)\s*\((\d+)\s*minutes\)/i);
      
      if (!titleMatch) {
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
          await parseAndStoreAIResponse(data.ai_response, data.id);
        }
      } catch (error) {
        console.error('Error fetching lesson plan:', error);
        toast.error("Failed to load lesson plan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLessonPlan();
      parseExistingLessonPlans();
    }
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
