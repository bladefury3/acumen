
import { useState, useEffect, useCallback } from 'react';
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

// Separate the PDF document into its own component for clarity
const LessonPDF = ({
  lessonTitle,
  sections,
  subject
}: DownloadLessonPDFProps) => {
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
  const [lessonObjectives, setLessonObjectives] = useState<string>(objectives);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.email) {
        setUserEmail(session.user.email);
      }
    };
    
    fetchUserEmail();
  }, [lessonId]);

  // Fetch and format all the sections for the PDF
  useEffect(() => {
    const fetchAllSections = async () => {
      if (!lessonId) return;
      
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('response_id', lessonId);
          
        if (error) throw error;
        
        let formattedSections = [...sections];
        
        if (data && data.length > 0) {
          if (data[0].learning_objectives) {
            let learningObjectivesContent = "";
            try {
              const parsedContent = JSON.parse(data[0].learning_objectives);
              if (Array.isArray(parsedContent)) {
                learningObjectivesContent = parsedContent.join(", ");
              } else {
                learningObjectivesContent = String(data[0].learning_objectives);
              }
            } catch {
              learningObjectivesContent = String(data[0].learning_objectives);
            }
            
            setLessonObjectives(learningObjectivesContent);
            
            const learningObjIndex = formattedSections.findIndex(
              section => section.title === "Learning Objectives"
            );
            
            if (learningObjIndex !== -1) {
              try {
                let objContent: string[] = [];
                try {
                  objContent = JSON.parse(String(data[0].learning_objectives));
                } catch {
                  objContent = String(data[0].learning_objectives).split('\n').filter(Boolean);
                }
                
                if (!Array.isArray(objContent)) {
                  objContent = [String(objContent)];
                }
                
                formattedSections[learningObjIndex] = {
                  ...formattedSections[learningObjIndex],
                  content: objContent
                };
              } catch (error) {
                console.error('Error parsing learning objectives:', error);
              }
            } else {
              try {
                let objContent: string[] = [];
                try {
                  objContent = JSON.parse(String(data[0].learning_objectives));
                } catch {
                  objContent = String(data[0].learning_objectives).split('\n').filter(Boolean);
                }
                
                if (!Array.isArray(objContent)) {
                  objContent = [String(objContent)];
                }
                
                formattedSections.unshift({
                  title: "Learning Objectives",
                  content: objContent
                });
              } catch (error) {
                console.error('Error parsing learning objectives:', error);
              }
            }
          }
          
          const sectionOrder = [
            "Learning Objectives",
            "Materials & Resources",
            "Introduction & Hook",
            "Activities",
            "Assessment Strategies",
            "Differentiation Strategies",
            "Close"
          ];
          
          const dbFieldToSectionTitle: Record<string, string> = {
            learning_objectives: "Learning Objectives",
            materials_resources: "Materials & Resources",
            introduction_hook: "Introduction & Hook",
            activities: "Activities",
            assessment_strategies: "Assessment Strategies",
            differentiation_strategies: "Differentiation Strategies",
            close: "Close"
          };
          
          sectionOrder.forEach(sectionTitle => {
            if (formattedSections.some(s => s.title === sectionTitle)) return;
            
            const dbField = Object.keys(dbFieldToSectionTitle).find(
              key => dbFieldToSectionTitle[key] === sectionTitle
            );
            
            if (!dbField) return;
            
            const lessonData = data[0];
            
            if (lessonData && lessonData[dbField as keyof typeof lessonData]) {
              const rawContent = lessonData[dbField as keyof typeof lessonData] as string;
              
              if (rawContent === "-") {
                if (sectionTitle === "Introduction & Hook" || sectionTitle === "Close") {
                  formattedSections.push({
                    title: sectionTitle,
                    content: ["No content available"]
                  });
                }
                return;
              }
              
              try {
                let content: string[] = [];
                
                if (typeof rawContent === 'string') {
                  try {
                    content = JSON.parse(rawContent);
                  } catch {
                    content = rawContent.split('\n').filter(Boolean);
                  }
                } else if (Array.isArray(rawContent)) {
                  content = rawContent;
                }
                
                if (content.length === 0) {
                  content = ["No content available"];
                }
                
                formattedSections.push({
                  title: sectionTitle,
                  content
                });
              } catch (error) {
                console.error(`Error parsing content for ${sectionTitle}:`, error);
                formattedSections.push({
                  title: sectionTitle,
                  content: ["Error loading content"]
                });
              }
            } else {
              if (sectionTitle === "Introduction & Hook" || sectionTitle === "Close") {
                formattedSections.push({
                  title: sectionTitle,
                  content: ["No content available"]
                });
              }
            }
          });
          
          setAllSections(formattedSections);
        } else {
          const completeSections = [...sections];
          
          if (!completeSections.some(s => s.title === "Introduction & Hook")) {
            completeSections.push({
              title: "Introduction & Hook",
              content: ["No content available"]
            });
          }
          
          if (!completeSections.some(s => s.title === "Close")) {
            completeSections.push({
              title: "Close",
              content: ["No content available"]
            });
          }
          
          setAllSections(completeSections);
        }
      } catch (error) {
        console.error('Error fetching lesson sections:', error);
        setAllSections(sections);
      }
    };
    
    fetchAllSections();
  }, [lessonId, sections]);

  // Cleanup function for the download process
  useEffect(() => {
    return () => {
      if (isGenerating) {
        setIsGenerating(false);
      }
    };
  }, [isGenerating]);

  // Timeout to reset generating state if download takes too long
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

  // Prevent duplicate email sending by wrapping logic in useCallback
  const sendEmail = useCallback(async () => {
    if (!userEmail || !lessonId || emailSent || !downloadStarted) return;
    
    try {
      const response = await supabase.functions.invoke('send-lesson-email', {
        body: {
          userEmail,
          lessonTitle,
          lessonObjectives,
          lessonId,
          subject
        }
      });
      
      if (response.error) {
        console.error('Error sending email:', response.error);
      } else {
        if (response.data && !response.data.skipped) {
          toast.success("Download link also sent to your email!");
          setEmailSent(true);
        } else if (response.data && response.data.skipped) {
          console.log("Email already sent previously, skipping");
          setEmailSent(true);
        }
      }
    } catch (error) {
      console.error('Error invoking send-lesson-email function:', error);
    }
  }, [userEmail, lessonId, lessonTitle, lessonObjectives, subject, emailSent, downloadStarted]);

  // Trigger email sending when download is complete
  useEffect(() => {
    if (downloadStarted && !isGenerating && !emailSent) {
      sendEmail();
    }
  }, [downloadStarted, isGenerating, emailSent, sendEmail]);

  const handleDownloadStart = () => {
    setIsGenerating(true);
    setDownloadStarted(false);
    toast.success("Starting PDF download...");
  };

  const handleDownloadComplete = () => {
    setIsGenerating(false);
    setDownloadStarted(true);
    toast.success("PDF downloaded successfully!");
  };

  const handleError = () => {
    setIsGenerating(false);
    setDownloadStarted(false);
    toast.error("Failed to generate PDF");
  };

  if (allSections.length === 0 && sections.length === 0) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2 bg-[#003C5A] text-[#C3CFF5]">
        <div className="h-4 w-4 border-2 border-[#C3CFF5] border-t-transparent rounded-full animate-spin" />
        Preparing Download...
      </Button>
    );
  }

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
