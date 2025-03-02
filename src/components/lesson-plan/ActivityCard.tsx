
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export interface ActivityCardProps {
  title: string;
  content: string[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, content }) => {
  // Ensure content is always an array
  const safeContent = Array.isArray(content) ? content : 
    (typeof content === 'string' ? [content] : []);
  
  // Enhanced markdown detection with more patterns
  const hasMarkdownContent = safeContent.length === 1 && (
    safeContent[0].includes('#') || 
    safeContent[0].includes('*') || 
    safeContent[0].includes('_') ||
    safeContent[0].includes('-') ||
    safeContent[0].includes('Part') ||
    safeContent[0].includes('1.') ||
    safeContent[0].includes(':') ||
    safeContent[0].includes('•')
  );

  // Make sure content is not empty
  if (!safeContent || safeContent.length === 0 || (safeContent.length === 1 && safeContent[0].trim() === '')) {
    return null;
  }
  
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in border-[#003C5A]/10">
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
          {hasMarkdownContent ? (
            <div className="markdown whitespace-pre-wrap">
              <ReactMarkdown>
                {safeContent[0]}
              </ReactMarkdown>
            </div>
          ) : (
            <ul className="list-disc pl-4 space-y-2 marker:text-[#003C5A]">
              {safeContent.map((item, idx) => (
                <li key={idx} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground transition-colors">
                  <div className="prose prose-sm max-w-none inline">
                    <ReactMarkdown>
                      {item}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
