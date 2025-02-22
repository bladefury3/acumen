
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Option {
  value: string;
  label: string;
}

// Helper function to fetch options from a table
const fetchOptions = async (tableName: string) => {
  const { data, error } = await supabase
    .from(tableName)
    .select("value, label")
    .order("label");
  if (error) throw error;
  return data as Option[];
};

export const useFormOptions = () => {
  // Array of table names and query keys for easy maintenance
  const tables = [
    { key: "gradeLevels", table: "grade_levels" },
    { key: "subjects", table: "subjects" },
    { key: "curriculumStandards", table: "curriculum_standards" },
    { key: "learningTools", table: "learning_tools" },
    { key: "learningNeeds", table: "learning_needs" },
    { key: "activities", table: "activities" },
    { key: "assessmentMethods", table: "assessment_methods" },
  ];

  // Use map to dynamically create queries
  const queries = tables.map(({ key, table }) =>
    useQuery({
      queryKey: [key],
      queryFn: () => fetchOptions(table),
    })
  );

  // Destructure and organize data and loading states
  const [
    { data: gradeLevels, isLoading: isLoadingGrades },
    { data: subjects, isLoading: isLoadingSubjects },
    { data: curriculumStandards, isLoading: isLoadingCurriculum },
    { data: learningTools, isLoading: isLoadingTools },
    { data: learningNeeds, isLoading: isLoadingNeeds },
    { data: activities, isLoading: isLoadingActivities },
    { data: assessmentMethods, isLoading: isLoadingAssessments },
  ] = queries;

  const isLoading =
    isLoadingGrades ||
    isLoadingSubjects ||
    isLoadingCurriculum ||
    isLoadingTools ||
    isLoadingNeeds ||
    isLoadingActivities ||
    isLoadingAssessments;

  return {
    gradeLevels: gradeLevels || [],
    subjects: subjects || [],
    curriculumStandards: curriculumStandards || [],
    learningTools: learningTools || [],
    learningNeeds: learningNeeds || [],
    activities: activities || [],
    assessmentMethods: assessmentMethods || [],
    isLoading,
  };
};