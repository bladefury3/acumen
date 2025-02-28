import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PreferenceCheckboxGroup from "@/components/onboarding/PreferenceCheckboxGroup";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const steps = [{
  title: "Grade Level",
  description: "Select the grade levels you teach",
  options: [{
    label: "K-2",
    value: "k_2"
  }, {
    label: "3-5",
    value: "3_5"
  }, {
    label: "6-8",
    value: "6_8"
  }, {
    label: "9-12",
    value: "9_12"
  }],
  key: "grade" as const
}, {
  title: "Subjects",
  description: "Select the subjects you teach",
  options: [{
    label: "Math",
    value: "math"
  }, {
    label: "Science",
    value: "science"
  }, {
    label: "English",
    value: "english"
  }, {
    label: "Social Studies",
    value: "social_studies"
  }, {
    label: "Art",
    value: "art"
  }, {
    label: "Music",
    value: "music"
  }, {
    label: "History",
    value: "history"
  }
  , {
    label: "Computer Science",
    value: "computer science"
  }, {
    label: "Physical Education",
    value: "physical education"
  }, {
    label: "Foreign Languages",
    value: "foreign languages"
  }, {
    label: "Other",
    value: "other"
  }],
  key: "subjects" as const
}, {
  title: "Goals",
  description: "What are your teaching goals?",
  options: [{
    label: "Improve student engagement",
    value: "engagement"
  }, {
    label: "Differentiate instruction",
    value: "differentiation"
  }, {
    label: "Integrate technology",
    value: "technology"
  }, {
    label: "Assessment strategies",
    value: "assessment"
  }, {
    label: "Save time",
    value: "savetime"
  }],
  key: "goals" as const
}];
interface PreferencesState {
  grade: string[];
  subjects: string[];
  goals: string[];
}
const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<PreferencesState>({
    grade: [],
    subjects: [],
    goals: []
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkSession();
  }, [navigate]);
  const handlePreferenceChange = (values: string[]) => {
    setPreferences({
      ...preferences,
      [steps[currentStep].key]: values
    });
  };
  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      setIsLoading(true);
      try {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");
        const {
          error
        } = await supabase.from('profiles').update({
          grade: preferences.grade,
          subjects: preferences.subjects,
          goals: preferences.goals
        }).eq('id', user.id);
        if (error) throw error;
        toast.success("Preferences saved successfully!");
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast.error("Failed to save preferences");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  const handleSkip = () => {
    if (currentStep === steps.length - 1) {
      navigate('/dashboard');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };
  const currentStepData = steps[currentStep];
  const progress = (currentStep + 1) / steps.length * 100;
  return <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStepData.title}
            </h1>
            <p className="text-gray-500 mt-2">{currentStepData.description}</p>
          </div>

          <PreferenceCheckboxGroup options={currentStepData.options} selectedValues={preferences[currentStepData.key]} onChange={handlePreferenceChange} />

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={handleSkip} disabled={isLoading}>
              Skip
            </Button>
            <Button onClick={handleNext} disabled={isLoading} className="text-slate-50">
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default Onboarding;