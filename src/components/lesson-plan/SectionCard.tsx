
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
      "Learning Objectives": <Target className="h-5 w-5 text-[#003C5A]" />,
      "Materials & Resources": <Boxes className="h-5 w-5 text-[#003C5A]" />,
      "Introduction & Hook": <BookOpen className="h-5 w-5 text-[#003C5A]" />,
      "Activities": <LayoutGrid className="h-5 w-5 text-[#003C5A]" />,
      "Assessment Strategies": <PenTool className="h-5 w-5 text-[#003C5A]" />,
      "Differentiation Strategies": <Brain className="h-5 w-5 text-[#003C5A]" />,
      "Close": <CheckCircle className="h-5 w-5 text-[#003C5A]" />
    };
    return iconMap[title] || <BookOpen className="h-5 w-5 text-[#003C5A]" />;
  };

  // Enhanced markdown content detection
  const hasMarkdownContent = content.length === 1 && (
    content[0].includes('#') || 
    content[0].includes('*') || 
    content[0].includes('_') ||
    content[0].includes('-') ||
    content[0].includes('Part') ||
    content[0].includes('1.') ||
    content[0].includes(':') ||
    content[0].includes('•')
  );

  // Make sure content is not empty
  if (!content || content.length === 0 || (content.length === 1 && content[0].trim() === '')) {
    return null;
  }

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
            <div className="markdown whitespace-pre-wrap">
              <ReactMarkdown>
                {content[0]}
              </ReactMarkdown>
            </div>
          ) : (
            <ul className="list-disc pl-4 space-y-2 marker:text-[#003C5A]">
              {content.map((item, idx) => (
                <li 
                  key={idx} 
                  className="text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="prose prose-sm max-w-none inline">
                    <ReactMarkdown>
                      {item}
                    </ReactMarkdown>
                  </div>
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
