
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ActivityCard from "./ActivityCard";

interface Activity {
  title: string;
  duration: string;
  steps: string[];
}

interface ContentSectionProps {
  title: string;
  content: string[];
  activities?: Activity[];
  generated?: boolean;
  onGenerateMore?: (title: string) => void;
  isGenerating?: boolean;
}

const ContentSection = ({
  title,
  content,
  activities,
  generated,
  onGenerateMore,
  isGenerating,
}: ContentSectionProps) => {
  const renderContent = (content: string) => {
    // Remove any potential HTML tags from content for security
    const sanitizedContent = content
      .replace(/<[^>]*>/g, '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    return sanitizedContent.map((line, index) => (
      <div key={index} className="mb-2">{line}</div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities ? (
          <div className="grid grid-cols-1 gap-6">
            {activities.map((activity, idx) => (
              <ActivityCard
                key={idx}
                index={idx}
                title={activity.title}
                duration={activity.duration}
                steps={activity.steps}
              />
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ul className="list-disc pl-4 space-y-2">
              {content.map((item, idx) => (
                <li key={idx}>{renderContent(item)}</li>
              ))}
            </ul>
          </div>
        )}
        {!generated && onGenerateMore && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => onGenerateMore(title)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate More'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentSection;
