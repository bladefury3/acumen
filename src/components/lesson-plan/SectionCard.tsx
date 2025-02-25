
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedSection } from "@/types/lesson";
import ActivityCard from "./ActivityCard";
import { BookOpen, Target, Boxes, Brain, PenTool, CheckCircle, LayoutGrid } from "lucide-react";

interface SectionCardProps {
  section: ParsedSection;
  onGenerateMore: (sectionTitle: string) => void;
  isGenerating: boolean;
}

const SectionCard = ({
  section,
  onGenerateMore,
  isGenerating
}: SectionCardProps) => {
  // Icon mapping for different section types
  const getSectionIcon = (title: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Learning Objectives": <Target className="h-5 w-5 text-primary" />,
      "Materials & Resources": <Boxes className="h-5 w-5 text-primary" />,
      "Introduction & Hook": <BookOpen className="h-5 w-5 text-primary" />,
      "Activities": <LayoutGrid className="h-5 w-5 text-primary" />,
      "Assessment Strategies": <PenTool className="h-5 w-5 text-primary" />,
      "Differentiation Strategies": <Brain className="h-5 w-5 text-primary" />,
      "Close": <CheckCircle className="h-5 w-5 text-primary" />
    };
    return iconMap[title] || <BookOpen className="h-5 w-5 text-primary" />;
  };

  // Check if this is one of the sections that should be half width
  const isHalfWidth = 
    section.title === "Learning Objectives" || 
    section.title === "Materials & Resources" ||
    section.title === "Assessment Strategies" ||
    section.title === "Differentiation Strategies";

  return (
    <Card 
      className={`${
        section.title === "Activities" ? 'col-span-2' : 
        isHalfWidth ? 'col-span-1' : 'col-span-2'
      } h-full transition-all duration-300 hover:shadow-lg animate-fade-in`}
    >
      <CardHeader className="flex flex-row items-center gap-2 pb-2 group">
        <div className="transition-transform duration-200 group-hover:scale-110">
          {getSectionIcon(section.title)}
        </div>
        <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {section.activities ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.activities.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ul className="list-disc pl-4 space-y-2 marker:text-primary">
              {section.content.map((item, idx) => (
                <li 
                  key={idx} 
                  className="text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {!section.generated && (
          <Button
            variant="secondary"
            onClick={() => onGenerateMore(section.title)}
            disabled={isGenerating}
            className="w-full bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate More'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
