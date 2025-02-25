
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ParsedSection } from "@/types/lesson";
import ActivityCard from "./ActivityCard";

interface SectionCardProps {
  section: ParsedSection;
  onGenerateMore: (sectionTitle: string) => void;
  isGenerating: boolean;
}

const SectionCard = ({ section, onGenerateMore, isGenerating }: SectionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {section.activities ? (
          <div className="grid grid-cols-1 gap-6">
            {section.activities.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
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
            onClick={() => onGenerateMore(section.title)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate More'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
