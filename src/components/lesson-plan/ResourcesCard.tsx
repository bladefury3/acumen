
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { blob } from "stream/consumers";

interface ResourcesCardProps {
  lessonPlanId: string;
  resourcesId?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  heading1: {
    fontSize: 24,
    marginBottom: 10,
  },
  heading2: {
    fontSize: 18,
    marginBottom: 8,
    marginTop: 15,
  },
  heading3: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
  },
  paragraph: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 5,
  }
});

// Create PDF Document component
const ResourcesPDF = ({ content }: { content: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading1}>Lesson Resources</Text>
        {content.split('\n').map((line, index) => {
          // Simple parsing of markdown headings and list items
          if (line.startsWith('# ')) {
            return <Text key={index} style={styles.heading1}>{line.substring(2)}</Text>;
          } else if (line.startsWith('## ')) {
            return <Text key={index} style={styles.heading2}>{line.substring(3)}</Text>;
          } else if (line.startsWith('### ')) {
            return <Text key={index} style={styles.heading3}>{line.substring(4)}</Text>;
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            return <Text key={index} style={styles.listItem}>• {line.substring(2)}</Text>;
          } else if (line.trim() !== '') {
            return <Text key={index} style={styles.paragraph}>{line}</Text>;
          }
          return null;
        })}
      </View>
    </Page>
  </Document>
);

const ResourcesCard = ({ 
  lessonPlanId, 
  resourcesId,
  onLoadingChange
}: ResourcesCardProps) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      setError(null);

      try {
        let id = resourcesId;

        // If no resourcesId is provided, try to fetch it
        if (!id) {
          const { data, error } = await supabase
            .rpc('get_lesson_resources_by_lesson_id', { p_lesson_plan_id: lessonPlanId });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            id = data[0].id;
          } else {
            throw new Error('No resources found for this lesson plan');
          }
        }

        // Fetch the content using the resource ID
        const { data, error } = await supabase
          .from('lesson_resources')
          .select('content')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setError(error.message || 'Failed to load resources');
      } finally {
        setIsLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    if (lessonPlanId) {
      fetchResources();
    }
  }, [lessonPlanId, resourcesId, onLoadingChange]);

  const handleCopyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => toast.success("Resources copied to clipboard"))
        .catch(err => toast.error("Failed to copy: " + err));
    }
  };

  const handleDownload = async () => {
    if (content) {
      try {
        // Generate PDF blob
        const pdfBlob = await pdf(<ResourcesPDF content={content} />).toBlob();
        
        // Create URL for the blob
        const url = URL.createObjectURL(pdfBlob);
        
        // Create link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lesson-resources.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("Resources downloaded as PDF");
      } catch (error) {
        console.error("Error creating PDF:", error);
        toast.error("Failed to download PDF");
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#003C5A]" />
        <p className="ml-2">Loading resources...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">
            <p>{error}</p>
            <p className="mt-2">Please try generating resources again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="prose prose-slate max-w-none">
          <div className="flex flex-wrap items-start gap-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1 text-[#003C5A] hover:bg-[#003C5A]/10"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="flex items-center gap-1 text-[#003C5A] hover:bg-[#003C5A]/10"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <div>
            <ReactMarkdown 
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-[#003C5A]" {...props}/>,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-6 text-[#003C5A]" {...props}/>,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-5 text-[#003C5A]" {...props}/>,
                h4: ({node, ...props}) => <h4 className="text-base font-bold mb-2 mt-4 text-[#003C5A]" {...props}/>,
                p: ({node, ...props}) => <p className="mb-4" {...props}/>,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props}/>,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props}/>,
                li: ({node, ...props}) => <li className="mb-1" {...props}/>,
                a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props}/>,
                strong: ({node, ...props}) => <strong className="font-bold" {...props}/>,
                em: ({node, ...props}) => <em className="italic" {...props}/>,
                code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1" {...props}/>,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props}/>,
                hr: ({node, ...props}) => <hr className="my-6" {...props}/>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesCard;
