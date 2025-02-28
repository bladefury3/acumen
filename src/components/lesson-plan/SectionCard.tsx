
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedSection } from "@/types/lesson";
import ActivityCard from "./ActivityCard";
import { 
  BookOpen, 
  Target, 
  Boxes, 
  Brain, 
  PenTool, 
  CheckCircle, 
  LayoutGrid 
} from "lucide-react";

interface SectionCardProps {
  section: ParsedSection;
  className?: string;
}

const SectionCard = ({ section, className = "" }: SectionCardProps) => {
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

  // Get minutes display for introduction & activities sections
  const getMinutesDisplay = (title: string) => {
    if (title === "Introduction & Hook") return "10 minutes";
    if (title === "Activities") return "25 minutes";
    return null;
  };

  const minutesDisplay = getMinutesDisplay(section.title);

  return (
    <Card className={`h-full border shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 group">
        <div className="flex items-center gap-2">
          <div className="transition-transform duration-200 group-hover:scale-110">
            {getSectionIcon(section.title)}
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">{section.title}</CardTitle>
        </div>
        {minutesDisplay && (
          <span className="text-xs font-medium px-2 py-1 bg-[#003C5A]/10 text-[#003C5A] rounded-full">
            {minutesDisplay}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {section.activities ? (
          <div className="grid grid-cols-1 gap-4">
            {section.activities.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {section.title === "Learning Objectives" ? (
              <div className="space-y-2">
                {section.content.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2 pl-0">
                {section.content.map((item, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-2"
                  >
                    <span className="text-[#003C5A] text-lg">•</span>
                    <span className="text-sm leading-relaxed text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
