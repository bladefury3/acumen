
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "@/types/lesson";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <Card className="bg-accent/50">
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
  );
};

export default ActivityCard;
