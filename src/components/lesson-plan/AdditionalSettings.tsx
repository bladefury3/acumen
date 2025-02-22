
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormOptions } from "@/hooks/use-form-options";
import { Skeleton } from "@/components/ui/skeleton";

interface AdditionalSettingsProps {
  curriculum: string;
  learningTools: string[];
  learningNeeds: string[];
  activities: string[];
  assessments: string[];
  onFieldChange: (field: string, value: string | string[]) => void;
}

const AdditionalSettings = ({
  curriculum,
  learningTools,
  learningNeeds,
  activities,
  assessments,
  onFieldChange,
}: AdditionalSettingsProps) => {
  const { 
    curriculumStandards,
    learningTools: learningToolsOptions,
    learningNeeds: learningNeedsOptions,
    activities: activitiesOptions,
    assessmentMethods,
    isLoading 
  } = useFormOptions();

  const handleMultiSelect = (field: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFieldChange(field, newValues);
  };

  if (isLoading) {
    return <div className="grid gap-6 pt-4">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      ))}
    </div>;
  }

  return (
    <div className="grid gap-8 pt-4">
      <div className="space-y-4">
        <Label>Curriculum Standards</Label>
        <RadioGroup
          value={curriculum}
          onValueChange={(value) => onFieldChange("curriculum", value)}
          className="space-y-2"
        >
          {curriculumStandards.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`curriculum-${option.value}`} />
              <Label htmlFor={`curriculum-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>Learning Tools</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          {learningToolsOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <Checkbox
                id={`tool-${option.value}`}
                checked={learningTools.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleMultiSelect("learningTools", option.value, learningTools)
                }
              />
              <Label
                htmlFor={`tool-${option.value}`}
                className="text-sm font-normal leading-tight"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Learning Needs</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          {learningNeedsOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <Checkbox
                id={`need-${option.value}`}
                checked={learningNeeds.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleMultiSelect("learningNeeds", option.value, learningNeeds)
                }
              />
              <Label
                htmlFor={`need-${option.value}`}
                className="text-sm font-normal leading-tight"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Lesson Activities</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          {activitiesOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <Checkbox
                id={`activity-${option.value}`}
                checked={activities.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleMultiSelect("activities", option.value, activities)
                }
              />
              <Label
                htmlFor={`activity-${option.value}`}
                className="text-sm font-normal leading-tight"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Assessment Methods</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          {assessmentMethods.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <Checkbox
                id={`assessment-${option.value}`}
                checked={assessments.includes(option.value)}
                onCheckedChange={(checked) => 
                  handleMultiSelect("assessments", option.value, assessments)
                }
              />
              <Label
                htmlFor={`assessment-${option.value}`}
                className="text-sm font-normal leading-tight"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdditionalSettings;
