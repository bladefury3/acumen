import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export interface ActivityCardProps {
  content: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ content }) => {
  const formattedContent = content || 'No activities available.';
  
  // Split content into lines
  const lines = formattedContent.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  // Group activities by detecting titles with durations
  const activities: { title: string; details: string[] }[] = [];
  let currentActivity: { title: string; details: string[] } | null = null;

  lines.forEach(line => {
    if (/\*\*(.*?)\*\*\s*\((\d+ minutes?)\)/.test(line)) {
      // If a new activity title is found, push the previous one and start a new group
      if (currentActivity) activities.push(currentActivity);
      currentActivity = { title: line, details: [] };
    } else if (currentActivity) {
      currentActivity.details.push(line);
    }
  });

  // Push the last activity if it exists
  if (currentActivity) activities.push(currentActivity);

  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity, idx) => (
          <Card key={idx} className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
            <CardHeader className="flex flex-row items-center gap-2 pb-2 group">
              <div className="transition-transform duration-200 group-hover:scale-110">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold">
                <ReactMarkdown>{activity.title}</ReactMarkdown>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <ul className="list-disc pl-4 space-y-2 marker:text-primary">
                {activity.details.map((step, stepIdx) => (
                  <li key={stepIdx} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors">
                    <ReactMarkdown>{step}</ReactMarkdown>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No activities found.</p>
      )}
    </div>
  );
};

export default ActivityCard;