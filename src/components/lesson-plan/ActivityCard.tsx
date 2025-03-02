import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

export interface ActivityCardProps {
  content: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ content }) => {
  const formattedContent = content || 'No activities available.';
  
  // Split content into lines and normalize whitespace
  const lines = formattedContent.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  // Dynamic activity extraction logic
  const activities: { title: string; duration: number; details: string[] }[] = [];
  let currentActivity: { title: string; duration: number; details: string[] } | null = null;
  let totalDuration = 0;
  let validActivityFormat = false;

  lines.forEach(line => {
    const markdownMatch = line.match(/####\s*(Activity\s*\d+:\s*.*?)(\((\d+)\s*minutes?\))?/i);
    const bulletMatch = line.match(/[\*\+\-]\s*\*\*(Activity\s*\d+:\s*.*?)(\((\d+)\s*minutes?\))?\*\*/i);
    const match = markdownMatch || bulletMatch;
    
    if (match) {
      validActivityFormat = true;
      // If a new activity title is found, push the previous one and start a new group
      if (currentActivity) activities.push(currentActivity);
      
      const activityTitle = match[1].trim();
      const activityDuration = match[3] ? parseInt(match[3], 10) : 0;
      totalDuration += activityDuration;
      
      currentActivity = { title: activityTitle, duration: activityDuration, details: [] };
    } else if (currentActivity) {
      currentActivity.details.push(line);
    }
  });

  // Push the last activity if it exists
  if (currentActivity) activities.push(currentActivity);

  if (!validActivityFormat) {
    // If the content format is not structured as activities, print raw Markdown output
    return (
      <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2 group">
          <div className="flex items-center gap-2">
            <div className="transition-transform duration-200 group-hover:scale-110">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold">Activities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 group">
        <div className="flex items-center gap-2">
          <div className="transition-transform duration-200 group-hover:scale-110">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">Activities</CardTitle>
        </div>
        <Badge className="text-xs font-medium bg-primary/10 text-primary">{totalDuration} min</Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {activities.map((activity, idx) => (
          <Card key={idx} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">
                <ReactMarkdown>{`**${activity.title} (${activity.duration} min)**`}</ReactMarkdown>
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
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;