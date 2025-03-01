
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedSection } from "@/types/lesson";
import ActivityCard from "./ActivityCard";
import { BookOpen, Target, Boxes, Brain, PenTool, CheckCircle, LayoutGrid } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SectionCardProps {
  section: ParsedSection;
}

const SectionCard = ({
  section
}: SectionCardProps) => {
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

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center gap-2 pb-2 group">
        <div className="transition-transform duration-200 group-hover:scale-110">
          {getSectionIcon(section.title)}
        </div>
        <CardTitle className="text-base sm:text-lg font-semibold">{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {section.activities ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <ReactMarkdown className="prose prose-sm max-w-none inline">
                    {item}
                  </ReactMarkdown>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
