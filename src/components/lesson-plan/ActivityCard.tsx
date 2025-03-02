
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export interface ActivityCardProps {
  title: string;
  content: string[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, content }) => {
  const safeContent = Array.isArray(content) ? content : [];
  
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 group">
        <div className="flex items-center gap-2">
          <div className="transition-transform duration-200 group-hover:scale-110">
            <LayoutGrid className="h-5 w-5 text-[#003C5A]" />
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="prose prose-sm max-w-none">
          <ul className="list-disc pl-4 space-y-2 marker:text-[#003C5A]">
            {safeContent.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors">
                <div className="prose prose-sm max-w-none inline">
                  <div className="activity-markdown">
                    <ReactMarkdown>{item}</ReactMarkdown>
                  </div>
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
