
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
  { value: "digital", label: "Digital Tools" },
  { value: "manipulatives", label: "Manipulatives" },
  { value: "visuals", label: "Visual Aids" },
  { value: "worksheets", label: "Worksheets" },
  { value: "videos", label: "Educational Videos" },
  { value: "games", label: "Educational Games" },
  { value: "books", label: "Books" },
];

export const learningNeedsOptions = [
  { value: "visual", label: "Visual Learners" },
  { value: "auditory", label: "Auditory Learners" },
  { value: "kinesthetic", label: "Kinesthetic Learners" },
  { value: "reading", label: "Reading/Writing Preference" },
  { value: "esl", label: "English Language Learners" },
  { value: "gifted", label: "Gifted and Talented" },
  { value: "special_ed", label: "Special Education" },
];

export const activitiesOptions = [
  { value: "group", label: "Group Work" },
  { value: "individual", label: "Individual Work" },
  { value: "discussion", label: "Class Discussion" },
  { value: "hands_on", label: "Hands-on Activities" },
  { value: "presentation", label: "Student Presentations" },
  { value: "project", label: "Project-based Learning" },
  { value: "experiment", label: "Experiments" },
];

export const assessmentOptions = [
  { value: "formative", label: "Formative Assessment" },
  { value: "summative", label: "Summative Assessment" },
  { value: "peer", label: "Peer Assessment" },
  { value: "self", label: "Self Assessment" },
  { value: "portfolio", label: "Portfolio" },
  { value: "rubric", label: "Rubric-based" },
  { value: "observation", label: "Teacher Observation" },
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
