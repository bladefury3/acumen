
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
    fontSize: 12
  },
  title: {
    fontSize: 24,
    marginBottom: 20
  },
  heading: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#003C5A'
  },
  content: {
    marginBottom: 10,
    lineHeight: 1.5
  },
  list: {
    marginLeft: 15
  },
  listItem: {
    marginBottom: 5
  }
});

const LessonPDF = ({
  lessonTitle,
  sections
}: DownloadLessonPDFProps) => <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{lessonTitle}</Text>
      {sections.map((section, index) => <View key={index}>
          <Text style={styles.heading}>{section.title}</Text>
          <View style={styles.list}>
            {section.content.map((item, itemIndex) => <Text key={itemIndex} style={styles.listItem}>
                • {item.replace(/^[-*•]\s*|\d+\.\s*/, '')}
              </Text>)}
          </View>
        </View>)}
    </Page>
  </Document>;

const DownloadLessonPDF = ({
  lessonTitle,
  sections,
  lessonId,
  subject = "",
  objectives = ""
}: DownloadLessonPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  return <PDFDownloadLink document={<LessonPDF lessonTitle={lessonTitle} sections={sections} />} fileName={`${lessonTitle.toLowerCase().replace(/\s+/g, '-')}-lesson-plan.pdf`} className="inline-block" onClick={handleDownloadStart}>
      {({
      loading,
      error,
      blob
    }) => {
      if (blob && isGenerating) {
        handleDownloadComplete();
      }
      if (error) {
        handleError();
        return null;
      }
      return <Button variant="outline" disabled={loading || isGenerating} className="flex items-center gap-2 bg-[#003C5A] text-[#C3CFF5]">
            {loading || isGenerating ? <div className="h-4 w-4 border-2 border-[#C3CFF5] border-t-transparent rounded-full animate-spin" /> : <Download className="h-4 w-4" />}
            {loading || isGenerating ? "Generating..." : "Download Lesson Plan"}
          </Button>;
    }}
    </PDFDownloadLink>;
};

export default DownloadLessonPDF;
