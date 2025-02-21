
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multiselect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
];

export const learningToolsOptions = [
  { value: "video_tutorials", label: "Video Tutorials" },
  { value: "interactive_simulations", label: "Interactive Simulations" },
  { value: "gamified_quizzes", label: "Gamified Quizzes" },
  { value: "collaborative_workspaces", label: "Collaborative Workspaces" },
  { value: "ai_assistants", label: "AI-Powered Assistants" },
];

export const learningNeedsOptions = [
  { value: "basic_concepts", label: "Basic Concepts" },
  { value: "advanced_topics", label: "Advanced Topics" },
  { value: "practical_applications", label: "Practical Applications" },
  { value: "real_world_examples", label: "Real-World Examples" },
  { value: "customized_paths", label: "Customized Learning Paths" },
];

export const activitiesOptions = [
  { value: "group_discussions", label: "Group Discussions" },
  { value: "hands_on_projects", label: "Hands-On Projects" },
  { value: "peer_reviews", label: "Peer Reviews" },
  { value: "self_assessment", label: "Self-Assessment Exercises" },
  { value: "case_studies", label: "Case Study Analyses" },
];

export const assessmentOptions = [
  { value: "multiple_choice", label: "Multiple Choice Questions" },
  { value: "short_answer", label: "Short Answer Responses" },
  { value: "project_submission", label: "Project Submissions" },
  { value: "peer_evaluation", label: "Peer Evaluations" },
  { value: "oral_presentation", label: "Oral Presentations" },
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
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label>Curriculum Standards</Label>
        <Select
          value={curriculum}
          onValueChange={(value) => onFieldChange("curriculum", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select curriculum standard" />
          </SelectTrigger>
          <SelectContent>
            {curriculumOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Learning Tools</Label>
        <MultiSelect
          options={learningToolsOptions}
          selected={learningTools}
          onChange={(values) => onFieldChange("learningTools", values)}
          placeholder="Select learning tools..."
        />
      </div>

      <div className="space-y-2">
        <Label>Learning Needs</Label>
        <MultiSelect
          options={learningNeedsOptions}
          selected={learningNeeds}
          onChange={(values) => onFieldChange("learningNeeds", values)}
          placeholder="Select learning needs..."
        />
      </div>

      <div className="space-y-2">
        <Label>Lesson Activities</Label>
        <MultiSelect
          options={activitiesOptions}
          selected={activities}
          onChange={(values) => onFieldChange("activities", values)}
          placeholder="Select lesson activities..."
        />
      </div>

      <div className="space-y-2">
        <Label>Assessment Methods</Label>
        <MultiSelect
          options={assessmentOptions}
          selected={assessments}
          onChange={(values) => onFieldChange("assessments", values)}
          placeholder="Select assessment methods..."
        />
      </div>
    </div>
  );
};

export default AdditionalSettings;
