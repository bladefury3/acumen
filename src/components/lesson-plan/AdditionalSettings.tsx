import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PreferenceCheckboxGroup from "@/components/onboarding/PreferenceCheckboxGroup";

interface AdditionalSettingsProps {
  curriculum: string;
  learningTools: string[];
  learningNeeds: string[];
  activities: string[];
  assessments: string[];
  onFieldChange: (field: string, value: string | string[]) => void;
}

export const curriculumOptions = [
  { value: "common_core", label: "Common Core Standards" },
  { value: "ngss", label: "Next Generation Science Standards" },
  { value: "state", label: "State Standards" },
  { value: "iste", label: "ISTE Standards" },
  { value: "ap", label: "Advanced Placement (AP) Guidelines" },
  { value: "ib", label: "International Baccalaureate (IB) Standards" },
  { value: "aero", label: "American Education Reaches Out (AERO)" },
  { value: "cambridge", label: "Cambridge International Standards" },
];

export const learningToolsOptions = [
  { value: "video_tutorials", label: "Video Tutorials" },
  { value: "interactive_simulations", label: "Interactive Simulations" },
  { value: "gamified_quizzes", label: "Gamified Quizzes" },
  { value: "collaborative_workspaces", label: "Collaborative Workspaces" },
  { value: "ai_assistants", label: "AI-Powered Assistants" },
  { value: "virtual_reality", label: "Virtual Reality Experiences" },
  { value: "augmented_reality", label: "Augmented Reality Tools" },
  { value: "digital_whiteboards", label: "Digital Whiteboards" },
  { value: "educational_apps", label: "Educational Apps" },
  { value: "learning_management", label: "Learning Management System" },
  { value: "podcasts", label: "Educational Podcasts" },
  { value: "ebooks", label: "Interactive E-books" },
  { value: "coding_platforms", label: "Coding Platforms" },
  { value: "mind_mapping", label: "Mind Mapping Tools" },
  { value: "presentation_tools", label: "Interactive Presentation Tools" },
];

export const learningNeedsOptions = [
  { value: "basic_concepts", label: "Basic Concepts" },
  { value: "advanced_topics", label: "Advanced Topics" },
  { value: "practical_applications", label: "Practical Applications" },
  { value: "real_world_examples", label: "Real-World Examples" },
  { value: "customized_paths", label: "Customized Learning Paths" },
  { value: "visual_learning", label: "Visual Learning Support" },
  { value: "auditory_learning", label: "Auditory Learning Support" },
  { value: "kinesthetic_learning", label: "Hands-on Learning Support" },
  { value: "reading_support", label: "Reading Comprehension Support" },
  { value: "writing_support", label: "Writing Skills Support" },
  { value: "math_support", label: "Mathematical Thinking Support" },
  { value: "language_support", label: "Language Learning Support" },
  { value: "social_emotional", label: "Social-Emotional Learning" },
  { value: "gifted_support", label: "Gifted and Talented Support" },
  { value: "remedial_support", label: "Remedial Learning Support" },
];

export const activitiesOptions = [
  { value: "group_discussions", label: "Group Discussions" },
  { value: "hands_on_projects", label: "Hands-On Projects" },
  { value: "peer_reviews", label: "Peer Reviews" },
  { value: "self_assessment", label: "Self-Assessment Exercises" },
  { value: "case_studies", label: "Case Study Analyses" },
  { value: "role_playing", label: "Role-Playing Activities" },
  { value: "debates", label: "Structured Debates" },
  { value: "lab_experiments", label: "Laboratory Experiments" },
  { value: "field_trips", label: "Virtual Field Trips" },
  { value: "presentations", label: "Student Presentations" },
  { value: "problem_solving", label: "Problem-Solving Challenges" },
  { value: "research_projects", label: "Research Projects" },
  { value: "creative_writing", label: "Creative Writing Exercises" },
  { value: "collaborative_work", label: "Collaborative Group Work" },
  { value: "demonstrations", label: "Interactive Demonstrations" },
  { value: "games", label: "Educational Games" },
  { value: "simulations", label: "Real-World Simulations" },
  { value: "storytelling", label: "Digital Storytelling" },
];

export const assessmentOptions = [
  { value: "multiple_choice", label: "Multiple Choice Questions" },
  { value: "short_answer", label: "Short Answer Responses" },
  { value: "project_submission", label: "Project Submissions" },
  { value: "peer_evaluation", label: "Peer Evaluations" },
  { value: "oral_presentation", label: "Oral Presentations" },
  { value: "portfolio", label: "Digital Portfolios" },
  { value: "performance_tasks", label: "Performance Tasks" },
  { value: "essays", label: "Essay Submissions" },
  { value: "lab_reports", label: "Laboratory Reports" },
  { value: "quizzes", label: "Pop Quizzes" },
  { value: "rubrics", label: "Rubric-Based Assessments" },
  { value: "self_reflection", label: "Self-Reflection Journals" },
  { value: "group_assessment", label: "Group Project Assessments" },
  { value: "demonstrations", label: "Skill Demonstrations" },
  { value: "online_tests", label: "Online Tests" },
  { value: "formative", label: "Formative Assessments" },
  { value: "summative", label: "Summative Assessments" },
  { value: "diagnostic", label: "Diagnostic Assessments" },
];

const AdditionalSettings = ({
  curriculum,
  learningTools,
  learningNeeds,
  activities,
  assessments,
  onFieldChange,
}: AdditionalSettingsProps) => {
  return (
    <div className="space-y-8 pt-4">
      <div className="space-y-4">
        <Label className="text-base">Curriculum Standards</Label>
        <RadioGroup
          value={curriculum}
          onValueChange={(value) => onFieldChange("curriculum", value)}
          className="gap-3"
        >
          {curriculumOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base">Learning Tools</Label>
        <PreferenceCheckboxGroup
          options={learningToolsOptions}
          selectedValues={learningTools}
          onChange={(values) => onFieldChange("learningTools", values)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base">Learning Needs</Label>
        <PreferenceCheckboxGroup
          options={learningNeedsOptions}
          selectedValues={learningNeeds}
          onChange={(values) => onFieldChange("learningNeeds", values)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base">Lesson Activities</Label>
        <PreferenceCheckboxGroup
          options={activitiesOptions}
          selectedValues={activities}
          onChange={(values) => onFieldChange("activities", values)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-base">Assessment Methods</Label>
        <PreferenceCheckboxGroup
          options={assessmentOptions}
          selectedValues={assessments}
          onChange={(values) => onFieldChange("assessments", values)}
        />
      </div>
    </div>
  );
};

export default AdditionalSettings;
