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
  const activities: { title: string; duration: number; details: string }[] = [];
  let totalDuration = 0;
  let mainActivityDuration = 0;
  let validActivityFormat = false;

  lines.forEach(line => {
    const mainActivityMatch = line.match(/^###\s*\d+\.\s*Main Activities \((\d+)\s*minutes?\)/i);
    const numberedMatch = line.match(/^\d+\.\s*\*\*(.*?)\*\*\s*\((\d+)\s*minutes?\):\s*(.*)/i);
    
    if (mainActivityMatch) {
      mainActivityDuration = parseInt(mainActivityMatch[1], 10);
    }
    
    if (numberedMatch) {
      validActivityFormat = true;
      
      const activityTitle = numberedMatch[1].trim();
      const activityDuration = parseInt(numberedMatch[2], 10);
      const activityDetails = numberedMatch[3].trim();
      
      totalDuration += activityDuration;
      
      activities.push({
        title: activityTitle,
        duration: activityDuration,
        details: activityDetails
      });
    }
  });

  if (!validActivityFormat) {
    // If the content format is not structured as activities, print raw Markdown output with proper styling
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
        <CardContent className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-md border border-gray-200">
          <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2 group">
          <div className="flex items-center gap-2">
            <div className="transition-transform duration-200 group-hover:scale-110">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold">Main Activities</CardTitle>
          </div>
          <Badge className="text-xs font-medium bg-primary/10 text-primary">{mainActivityDuration} min</Badge>
        </CardHeader>
      </Card>
      
      {activities.map((activity, idx) => (
        <Card key={idx} className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">
              <ReactMarkdown>{`**${activity.title} (${activity.duration} min)**`}</ReactMarkdown>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            <p className="text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors">
              <ReactMarkdown>{activity.details}</ReactMarkdown>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityCard;
