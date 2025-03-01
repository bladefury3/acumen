
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormOptions } from "@/hooks/use-form-options";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface BasicInformationProps {
  objectives: string;
  grade: string;
  subject: string;
  funElements: string;
  duration: string;
  formattedGradeLevels: string,
  onFieldChange: (field: string, value: string) => void;
}



const BasicInformation = ({
  objectives,
  grade,
  subject,
  formattedGradeLevels,
  funElements,
  duration,
  onFieldChange,
}: BasicInformationProps) => {
  const { gradeLevels = [], subjects = [], isLoading } = useFormOptions();

  if (isLoading) {
    return <div className="space-y-6">
      <Skeleton className="h-[100px] w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[40px] w-full" />
        <Skeleton className="h-[40px] w-full" />
        <Skeleton className="h-[40px] w-full" />
      </div>
      <Skeleton className="h-[40px] w-full" />
    </div>;
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor="objectives">
          Lesson Objectives<span className="text-red-500 ml-1">*</span>
        </Label>
        <Textarea
          id="objectives"
          placeholder="After completing the lesson, the student will be able to..."
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
        <Select
          value={grade}
          onValueChange={(value) => onFieldChange("grade", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grade level" />
          </SelectTrigger>
          <SelectContent>
            {formattedGradeLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject<span className="text-red-500 ml-1">*</span>
        </Label>
        <Select
          value={subject}
          onValueChange={(value) => onFieldChange("subject", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((sub) => (
              <SelectItem key={sub.value} value={sub.value}>
                {sub.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {["15","30", "45", "60", "90"].map((duration) => (
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
