
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { toast } from "sonner";

interface ResourcesCardProps {
  lessonPlanId: string;
  resourcesId?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#003C5A',
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#D95D27',
  },
  content: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  list: {
    marginLeft: 15,
  },
  listItem: {
    marginBottom: 5,
  },
});

// Helper function to format the content with proper headings, paragraphs, and lists
const formatContent = (content: string) => {
  if (!content) return [];
  
  // Split content by headings (lines with some capitalized words and a colon)
  const sections = [];
  let currentSection = { title: "Overview", content: [] };
  
  content.split('\n').forEach(line => {
    // If line starts with #, it's a heading
    if (line.match(/^#+\s+/)) {
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { 
        title: line.replace(/^#+\s+/, '').trim(), 
        content: [] 
      };
    }
    // If line starts with numbers or bullet points
    else if (line.match(/^\d+\.\s+/) || line.match(/^[-*]\s+/)) {
      currentSection.content.push(line.trim());
    }
    // If line is all caps or has a colon, it's likely a subheading
    else if (line.match(/^[A-Z\s]+:/) || line.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+:/) || line.match(/^\w+\s*:$/)) {
      if (line.trim()) {
        sections.push({ ...currentSection });
        currentSection = { 
          title: line.trim(), 
          content: [] 
        };
      }
    }
    // Empty lines or regular content
    else {
      if (line.trim()) {
        currentSection.content.push(line.trim());
      }
    }
  });
  
  // Add the last section
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
};

const ResourcesDocument = ({ content, title }: { content: string, title: string }) => {
  const formattedContent = formatContent(content);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        
        {formattedContent.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((item, itemIndex) => {
              // Check if line is a list item
              const isListItem = item.match(/^\d+\.\s+/) || item.match(/^[-*]\s+/);
              
              return (
                <Text 
                  key={itemIndex} 
                  style={isListItem ? styles.listItem : styles.content}
                >
                  {item}
                </Text>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
};

interface ResourceData {
  id: string;
  content: string;
  lesson_plan_id?: string;
  created_at?: string;
}

const ResourcesCard = ({ lessonPlanId, resourcesId: initialResourcesId }: ResourcesCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<ResourceData | null>(null);
  const [lessonTitle, setLessonTitle] = useState("Lesson Resources");
  
  useEffect(() => {
    const fetchResources = async () => {
      if (!lessonPlanId && !initialResourcesId) return;
      
      setIsLoading(true);
      try {
        // First get the lesson plan title
        const { data: lessonPlan } = await supabase
          .from('lesson_plans')
          .select('grade, subject')
          .eq('id', lessonPlanId)
          .single();
          
        if (lessonPlan) {
          setLessonTitle(`${lessonPlan.grade} ${lessonPlan.subject} Resources`);
        }
        
        // Then get the resources
        let query = initialResourcesId 
          ? `id=eq.${initialResourcesId}`
          : `lesson_plan_id=eq.${lessonPlanId}`;
          
        const { data, error } = await supabase
          .from('lesson_resources')
          .select('*')
          .or(query)
          .single();
        
        if (error) {
          console.error("Error fetching resources:", error);
          return;
        }
        
        if (data) {
          setResources(data as ResourceData);
        }
      } catch (error) {
        console.error("Error in fetch resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, [lessonPlanId, initialResourcesId]);
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading Resources...
          </CardTitle>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center">
          <p className="text-muted-foreground">Please wait while we load the resources...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!resources) {
    return null;
  }
  
  return (
    <Card className="shadow-md border-t-4 border-t-[#D95D27]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-[#D95D27]" />
          Lesson Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download these teaching resources to support your lesson plan. Includes worksheets, assessment materials, 
            and extension activities.
          </p>
          
          <PDFDownloadLink
            document={<ResourcesDocument content={resources.content} title={lessonTitle} />}
            fileName={`${lessonTitle.toLowerCase().replace(/\s+/g, '-')}-resources.pdf`}
            className="inline-block w-full"
          >
            {({ loading, error }) => {
              if (error) {
                toast.error("Failed to generate PDF");
                return null;
              }
              
              return (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 bg-[#003C5A] text-[#C3CFF5] hover:bg-[#003C5A]/90 hover:text-[#C3CFF5]"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {loading ? "Preparing PDF..." : "Download Resources"}
                </Button>
              );
            }}
          </PDFDownloadLink>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesCard;
