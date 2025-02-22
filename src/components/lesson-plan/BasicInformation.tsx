import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combobox";
import { useFormOptions } from "@/hooks/use-form-options";
import { Skeleton } from "@/components/ui/skeleton";

interface BasicInformationProps {
  objectives: string;
  grade: string;
  subject: string;
  funElements: string;
  duration: string;
  onFieldChange: (field: string, value: string) => void;
}

const BasicInformation = ({
  objectives,
  grade,
  subject,
  funElements,
  duration,
  onFieldChange,
}: BasicInformationProps) => {
  const {
    gradeLevels = [],
    subjects = [],
    isLoading,
  } = useFormOptions();

  // More rigorous safety checks
  const safeGradeLevels = Array.isArray(gradeLevels) ? gradeLevels : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  // Debugging logs to check the values
  console.log("Grade Levels:", safeGradeLevels);
  console.log("Subjects:", safeSubjects);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[100px] w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[40px] w-full" />
          <Skeleton className="h-[40px] w-full" />
          <Skeleton className="h-[40px] w-full" />
        </div>
        <Skeleton className="h-[40px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor="objectives">
          Lesson Objectives<span className="text-red-500 ml-1">*</span>
        </Label>
        <Textarea
          id="objectives"
          placeholder="What will students learn?"
          className="min-h-[100px]"
          value={objectives}
          onChange={(e) => onFieldChange("objectives", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="grade">
            Grade Level<span className="text-red-500 ml-1">*</span>
          </Label>
          {safeGradeLevels.length > 0 ? (
            <Combobox
              options={safeGradeLevels}
              value={grade}
              onChange={(value) => onFieldChange("grade", value)}
              placeholder="Select grade level"
            />
          ) : (
            <Input
              disabled
              placeholder="No grade levels available"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">
            Subject<span className="text-red-500 ml-1">*</span>
          </Label>
          {safeSubjects.length > 0 ? (
            <Combobox
              options={safeSubjects}
              value={subject}
              onChange={(value) => onFieldChange("subject", value)}
              placeholder="Select subject"
            />
          ) : (
            <Input
              disabled
              placeholder="No subjects available"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="funElements">Fun Elements</Label>
          <Input
            id="funElements"
            placeholder="e.g., Interactive Games"
            value={funElements}
            onChange={(e) => onFieldChange("funElements", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Lesson Duration<span className="text-red-500 ml-1">*</span>
        </Label>
        <RadioGroup
          value={duration}
          onValueChange={(value) => onFieldChange("duration", value)}
          className="flex gap-4 flex-wrap"
          required
        >
          {["30", "45", "60", "90"].map((duration) => (
            <div key={duration} className="flex items-center space-x-2">
              <RadioGroupItem value={duration} id={`duration-${duration}`} />
              <Label htmlFor={`duration-${duration}`}>{duration} mins</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default BasicInformation;