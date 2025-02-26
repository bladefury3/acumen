
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { ParsedSection } from '@/types/lesson';
import { toast } from 'sonner';

interface DownloadLessonPDFProps {
  lessonTitle: string;
  sections: ParsedSection[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#334155',
  },
  content: {
    marginBottom: 10,
    lineHeight: 1.5,
  },
  activityTitle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    color: '#475569',
  },
  list: {
    marginLeft: 15,
  },
  listItem: {
    marginBottom: 5,
  },
});

const LessonPDF = ({ lessonTitle, sections }: DownloadLessonPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{lessonTitle}</Text>
      {sections.map((section, index) => (
        <View key={index}>
          <Text style={styles.heading}>{section.title}</Text>
          {section.activities ? (
            section.activities.map((activity, actIndex) => (
              <View key={actIndex}>
                <Text style={styles.activityTitle}>
                  {activity.title} ({activity.duration})
                </Text>
                <View style={styles.list}>
                  {activity.steps.map((step, stepIndex) => (
                    <Text key={stepIndex} style={styles.listItem}>
                      • {step}
                    </Text>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.list}>
              {section.content.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

const DownloadLessonPDF = ({ lessonTitle, sections }: DownloadLessonPDFProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <PDFDownloadLink
      document={<LessonPDF lessonTitle={lessonTitle} sections={sections} />}
      fileName={`${lessonTitle.toLowerCase().replace(/\s+/g, '-')}-lesson-plan.pdf`}
      className="inline-block"
    >
      {({ loading, error }) => {
        if (error) {
          toast.error("Failed to generate PDF");
          return null;
        }

        return (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading || isGenerating}
            onClick={() => {
              setIsGenerating(true);
              toast.success("Generating PDF...");
            }}
          >
            {loading || isGenerating ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading || isGenerating ? "Generating..." : "Download Lesson Plan"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default DownloadLessonPDF;
