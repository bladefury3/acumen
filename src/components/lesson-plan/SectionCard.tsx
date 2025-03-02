
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Boxes, Brain, PenTool, CheckCircle, LayoutGrid } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface SectionCardProps {
  title: string;
  content: string[];
}

const SectionCard = ({
  title,
  content
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

  // If content is a single string, we'll render it as markdown directly
  const hasMarkdownContent = content.length === 1 && (
    content[0].includes('#') || 
    content[0].includes('*') || 
    content[0].includes('_') ||
    content[0].includes('-')
  );

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center gap-2 pb-2 group">
        <div className="transition-transform duration-200 group-hover:scale-110">
          {getSectionIcon(title)}
        </div>
        <CardTitle className="text-base sm:text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="prose prose-sm max-w-none">
          {hasMarkdownContent ? (
            <ReactMarkdown className="markdown">
              {content[0]}
            </ReactMarkdown>
          ) : (
            <ul className="list-disc pl-4 space-y-2 marker:text-[#003C5A]">
              {content.map((item, idx) => (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionCard;
