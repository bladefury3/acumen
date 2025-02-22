
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BasicInformationProps {
  objectives: string;
  grade: string;
  subject: string;
  funElements: string;
  duration: string;
  onFieldChange: (field: string, value: string) => void;
}

export const gradeOptions = [
  { value: "k", label: "Kindergarten" },
  { value: "1", label: "1st Grade" },
  { value: "2", label: "2nd Grade" },
  { value: "3", label: "3rd Grade" },
  { value: "4", label: "4th Grade" },
  { value: "5", label: "5th Grade" },
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
];

export const subjectOptions = [
  { value: "math", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "art", label: "Art" },
  { value: "music", label: "Music" },
  { value: "pe", label: "Physical Education" },
];

const BasicInformation = ({
  objectives,
  grade,
  subject,
  funElements,
  duration,
  onFieldChange,
}: BasicInformationProps) => {
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
          <Select
            value={grade}
            onValueChange={(value) => onFieldChange("grade", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade level" />
            </SelectTrigger>
            <SelectContent>
              {gradeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
