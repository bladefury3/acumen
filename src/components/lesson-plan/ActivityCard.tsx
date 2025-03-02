
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "@/services/lesson/types";
import ReactMarkdown from "react-markdown";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <Card className="bg-accent/50">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base sm:text-lg">{activity.activity_name}</CardTitle>
        <CardDescription>{activity.duration}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="prose prose-sm max-w-none">
          <h3 className="text-sm font-medium mb-2">Instructions:</h3>
          <ul className="list-disc pl-4 space-y-2 text-sm">
            {activity.steps.map((step, stepIdx) => (
              <li key={stepIdx} className="leading-relaxed">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {step}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
