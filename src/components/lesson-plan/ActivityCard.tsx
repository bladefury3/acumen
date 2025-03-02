
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

export interface ActivityCardProps {
  content: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  content
}) => {
  const formattedContent = content || 'No activities available.';

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 group">
        <div className="flex items-center gap-2">
          <div className="transition-transform duration-200 group-hover:scale-110">
            <LayoutGrid className="h-5 w-5 text-[#003C5A]" />
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">Activities</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-md border border-gray-200 text-sm leading-relaxed">
        <div className="activity-markdown">
          <ReactMarkdown>
            {formattedContent}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
