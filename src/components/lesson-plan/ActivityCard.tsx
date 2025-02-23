
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ActivityProps {
  index: number;
  title: string;
  duration: string;
  steps: string[];
}

const ActivityCard = ({ index, title, duration, steps }: ActivityProps) => {
  return (
    <Card className="bg-accent/50">
      <CardHeader>
        <CardTitle className="text-xl">Activity {index + 1}: {title}</CardTitle>
        <CardDescription>{duration}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <h3 className="text-sm font-medium mb-2">Instructions:</h3>
          <ul className="list-decimal pl-4 space-y-2">
            {steps.map((step, stepIdx) => (
              <li key={stepIdx}>{step}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
