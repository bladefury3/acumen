
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";
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

  if (isLoading) {
    return <div className="grid gap-6 pt-4">
      {[1,2,3,4,5].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  return (
    <div className="grid gap-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Standards</CardTitle>
        </CardHeader>
        <CardContent>
          <Combobox
            options={curriculumStandards}
            value={curriculum}
            onChange={(value) => onFieldChange("curriculum", value)}
            placeholder="Select curriculum standard"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiCombobox
            options={learningToolsOptions}
            selected={learningTools}
            onChange={(values) => onFieldChange("learningTools", values)}
            placeholder="Select learning tools"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Needs</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiCombobox
            options={learningNeedsOptions}
            selected={learningNeeds}
            onChange={(values) => onFieldChange("learningNeeds", values)}
            placeholder="Select learning needs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiCombobox
            options={activitiesOptions}
            selected={activities}
            onChange={(values) => onFieldChange("activities", values)}
            placeholder="Select lesson activities"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiCombobox
            options={assessmentMethods}
            selected={assessments}
            onChange={(values) => onFieldChange("assessments", values)}
            placeholder="Select assessment methods"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalSettings;
