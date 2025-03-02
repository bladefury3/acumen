
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@/types/lesson';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';

interface ActivityCardProps {
  title: string;
  content: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, content }) => {
  // Format the content string as needed
  const formattedContent = content || 'No activities available.';

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-[#003C5A] text-[#C3CFF5] rounded-t-lg">
        <CardTitle className="text-xl font-bold flex justify-between items-center">
          <span>{title}</span>
          <Badge className="bg-[#D95D27] text-[#FCEDEB] hover:bg-[#D95D27]/90">
            Activities
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose max-w-none dark:prose-invert">
          <ReactMarkdown>{formattedContent}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
