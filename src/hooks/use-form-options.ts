
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Option {
  value: string;
  label: string;
}

export const useFormOptions = () => {
  const { data: gradeLevels, isLoading: isLoadingGrades } = useQuery({
    queryKey: ["gradeLevels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grade_levels")
        .select("value, label")
        .order("value");
  
      if (error) throw error;
  
      // Sorting Logic
      const sortedData = data.sort((a, b) => {
        // Handle Kindergarten ('K') first
        if (a.value.toLowerCase() === 'k') return -1;
        if (b.value.toLowerCase() === 'k') return 1;
  
        // Convert value to number for proper numeric sorting
        return parseInt(a.value) - parseInt(b.value);
      });
  
      // Return the sorted data without altering the structure
      return sortedData as Option[];
    }
  });
  

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("value, label")
        .order("label");
      if (error) throw error;
      return data as Option[];
    },
  });

  const { data: curriculumStandards, isLoading: isLoadingCurriculum } = useQuery({
    queryKey: ["curriculumStandards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curriculum_standards")
        .select("value, label")
        .order("label");
      if (error) throw error;
      return data as Option[];
    },
  });

  const { data: learningTools, isLoading: isLoadingTools } = useQuery({
    queryKey: ["learningTools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_tools")
        .select("value, label")
        .order("label");
      if (error) throw error;
      return data as Option[];
    },
  });

  const { data: learningNeeds, isLoading: isLoadingNeeds } = useQuery({
    queryKey: ["learningNeeds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_needs")
        .select("value, label")
        .order("label");
      if (error) throw error;
      return data as Option[];
    },
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("value, label")
        .order("label");
      if (error) throw error;
      return data as Option[];
    },
  });

  const { data: assessmentMethods, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ["assessmentMethods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessment_methods")
        .select("value, label")
        .order("label");
      if (error) throw error;
      return data as Option[];
    },
  });

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
