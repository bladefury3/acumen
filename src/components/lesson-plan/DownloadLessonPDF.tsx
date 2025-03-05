
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { ParsedSection } from '@/types/lesson';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DownloadLessonPDFProps {
  lessonTitle: string;
  sections: ParsedSection[];
  lessonId?: string;
  subject?: string;
  objectives?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
    lineHeight: 1.5
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#003C5A',
    textAlign: 'center'
  },
  heading: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#003C5A',
    borderBottom: '1 solid #D1D5DB'
  },
  content: {
    marginBottom: 10,
    lineHeight: 1.5
  },
  list: {
    marginLeft: 15,
    marginBottom: 15
  },
  listItem: {
    marginBottom: 8
  },
  sectionContainer: {
    marginBottom: 15
  },
  metadata: {
    marginTop: 5,
    marginBottom: 15,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center'
  }
});

const LessonPDF = ({
  lessonTitle,
  sections,
  subject
}: DownloadLessonPDFProps) => {
  // Format the current date for the PDF
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{lessonTitle}</Text>
        <Text style={styles.metadata}>
          {subject} | Generated on {formattedDate}
        </Text>
        
        {sections.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <Text style={styles.heading}>{section.title}</Text>
            {section.content && section.content.length > 0 ? (
              <View style={styles.list}>
                {section.content.map((item, itemIndex) => (
                  <Text key={itemIndex} style={styles.listItem}>
                    • {item.replace(/^[-*•]\s*|\d+\.\s*/, '')}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.content}>No content available for this section</Text>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
};

const DownloadLessonPDF = ({
  lessonTitle,
  sections,
  lessonId,
  subject = "",
  objectives = ""
}: DownloadLessonPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allSections, setAllSections] = useState<ParsedSection[]>([]);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.email) {
        setUserEmail(session.user.email);
      }
    };
    
    fetchUserEmail();
  }, []);

  useEffect(() => {
    // Fetch all lesson sections from the database
    const fetchAllSections = async () => {
      if (!lessonId) return;
      
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('response_id', lessonId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Organize the sections in a logical order
          const sectionOrder = [
            "Learning Objectives",
            "Materials & Resources",
            "Introduction & Hook",
            "Activities",
            "Assessment Strategies",
            "Differentiation Strategies",
            "Close"
          ];
          
          // Map database fields to section titles
          const dbFieldToSectionTitle: Record<string, string> = {
            learning_objectives: "Learning Objectives",
            materials_resources: "Materials & Resources",
            introduction_hook: "Introduction & Hook",
            activities: "Activities",
            assessment_strategies: "Assessment Strategies",
            differentiation_strategies: "Differentiation Strategies",
            close: "Close"
          };
          
          const formattedSections: ParsedSection[] = [];
          
          // First add the sections we already have
          if (sections && sections.length > 0) {
            formattedSections.push(...sections);
          }
          
          // Then add sections from the database that aren't already included
          sectionOrder.forEach(sectionTitle => {
            // Skip if we already have this section
            if (formattedSections.some(s => s.title === sectionTitle)) return;
            
            // Find the database field that corresponds to this section title
            const dbField = Object.keys(dbFieldToSectionTitle).find(
              key => dbFieldToSectionTitle[key] === sectionTitle
            );
            
            if (!dbField) return;
            
            // Find the section data in the database
            const lessonData = data[0];
            
            if (lessonData && lessonData[dbField as keyof typeof lessonData]) {
              try {
                // Parse the content from JSON if it's stored that way, or split by newlines
                let content: string[] = [];
                const rawContent = lessonData[dbField as keyof typeof lessonData] as string;
                
                if (typeof rawContent === 'string') {
                  try {
                    content = JSON.parse(rawContent);
                  } catch {
                    content = rawContent.split('\n').filter(Boolean);
                  }
                } else if (Array.isArray(rawContent)) {
                  content = rawContent;
                }
                
                formattedSections.push({
                  title: sectionTitle,
                  content
                });
              } catch (error) {
                console.error(`Error parsing content for ${sectionTitle}:`, error);
              }
            }
          });
          
          setAllSections(formattedSections);
        } else {
          // If no data from database, use the sections provided
          setAllSections(sections);
        }
      } catch (error) {
        console.error('Error fetching lesson sections:', error);
        // Fallback to using the sections provided
        setAllSections(sections);
      }
    };
    
    fetchAllSections();
  }, [lessonId, sections]);

  useEffect(() => {
    return () => {
      if (isGenerating) {
        setIsGenerating(false);
      }
    };
  }, [isGenerating]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isGenerating) {
      timeoutId = setTimeout(() => {
        setIsGenerating(false);
      }, 5000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isGenerating]);

  const handleDownloadStart = async () => {
    setIsGenerating(true);
    toast.success("Starting PDF download...");
  };

  const handleDownloadComplete = async () => {
    setIsGenerating(false);
    toast.success("PDF downloaded successfully!");
    
    // Send email notification if we have user email and lessonId
    if (userEmail && lessonId) {
      try {
        const response = await supabase.functions.invoke('send-lesson-email', {
          body: {
            userEmail,
            lessonTitle,
            lessonObjectives: objectives,
            lessonId,
            subject
          }
        });
        
        if (response.error) {
          console.error('Error sending email:', response.error);
        } else {
          toast.success("Download link also sent to your email!");
        }
      } catch (error) {
        console.error('Error invoking send-lesson-email function:', error);
      }
    }
  };

  const handleError = () => {
    setIsGenerating(false);
    toast.error("Failed to generate PDF");
  };

  // Don't render until we have sections
  if (allSections.length === 0 && sections.length === 0) {
    return <Button variant="outline" disabled className="flex items-center gap-2 bg-[#003C5A] text-[#C3CFF5]">
      <div className="h-4 w-4 border-2 border-[#C3CFF5] border-t-transparent rounded-full animate-spin" />
      Preparing Download...
    </Button>;
  }

  // Use allSections if available, otherwise fallback to the original sections
  const sectionsToUse = allSections.length > 0 ? allSections : sections;

  return (
    <PDFDownloadLink 
      document={<LessonPDF lessonTitle={lessonTitle} sections={sectionsToUse} subject={subject} />} 
      fileName={`${lessonTitle.toLowerCase().replace(/\s+/g, '-')}-lesson-plan.pdf`} 
      className="inline-block"
      onClick={handleDownloadStart}
    >
      {({loading, error, blob}) => {
        if (blob && isGenerating) {
          handleDownloadComplete();
        }
        if (error) {
          handleError();
          return null;
        }
        return (
          <Button 
            variant="outline" 
            disabled={loading || isGenerating} 
            className="flex items-center gap-2 bg-[#003C5A] text-[#C3CFF5]"
          >
            {loading || isGenerating ? 
              <div className="h-4 w-4 border-2 border-[#C3CFF5] border-t-transparent rounded-full animate-spin" /> : 
              <Download className="h-4 w-4" />
            }
            {loading || isGenerating ? "Generating..." : "Download Lesson Plan"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default DownloadLessonPDF;
