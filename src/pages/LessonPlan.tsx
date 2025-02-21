
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MultiSelect } from "@/components/ui/multiselect";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Settings, ChevronRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

interface LessonPlanForm {
  objectives: string;
  grade: string;
  subject: string;
  funElements: string;
  duration: string;
  curriculum: string;
  learningTools: string[];
  learningNeeds: string[];
  activities: string[];
  assessments: string[];
}

const gradeOptions = [
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

const subjectOptions = [
  { value: "math", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "art", label: "Art" },
  { value: "music", label: "Music" },
  { value: "pe", label: "Physical Education" },
];

const curriculumOptions = [
  { value: "common_core", label: "Common Core Standards" },
  { value: "ngss", label: "Next Generation Science Standards" },
  { value: "state", label: "State Standards" },
  { value: "iste", label: "ISTE Standards" },
];

const learningToolsOptions = [
  { value: "digital", label: "Digital Tools" },
  { value: "manipulatives", label: "Manipulatives" },
  { value: "visuals", label: "Visual Aids" },
  { value: "worksheets", label: "Worksheets" },
  { value: "videos", label: "Educational Videos" },
  { value: "games", label: "Educational Games" },
  { value: "books", label: "Books" },
];

const learningNeedsOptions = [
  { value: "visual", label: "Visual Learners" },
  { value: "auditory", label: "Auditory Learners" },
  { value: "kinesthetic", label: "Kinesthetic Learners" },
  { value: "reading", label: "Reading/Writing Preference" },
  { value: "esl", label: "English Language Learners" },
  { value: "gifted", label: "Gifted and Talented" },
  { value: "special_ed", label: "Special Education" },
];

const activitiesOptions = [
  { value: "group", label: "Group Work" },
  { value: "individual", label: "Individual Work" },
  { value: "discussion", label: "Class Discussion" },
  { value: "hands_on", label: "Hands-on Activities" },
  { value: "presentation", label: "Student Presentations" },
  { value: "project", label: "Project-based Learning" },
  { value: "experiment", label: "Experiments" },
];

const assessmentOptions = [
  { value: "formative", label: "Formative Assessment" },
  { value: "summative", label: "Summative Assessment" },
  { value: "peer", label: "Peer Assessment" },
  { value: "self", label: "Self Assessment" },
  { value: "portfolio", label: "Portfolio" },
  { value: "rubric", label: "Rubric-based" },
  { value: "observation", label: "Teacher Observation" },
];

const LessonPlan = () => {
  const [formData, setFormData] = useState<LessonPlanForm>({
    objectives: "",
    grade: "",
    subject: "",
    funElements: "",
    duration: "45",
    curriculum: "",
    learningTools: [],
    learningNeeds: [],
    activities: [],
    assessments: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    toast.success("Lesson plan saved successfully!");
  };

  const sidebarItems = [
    { label: "My Lessons", href: "/dashboard", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Create Lesson Plan</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-primary">Create Lesson Plan</h1>
          <p className="text-muted-foreground mt-2">
            Design an engaging lesson for your students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="objectives">Lesson Objectives</Label>
              <Textarea
                id="objectives"
                placeholder="What will students learn?"
                className="min-h-[100px]"
                value={formData.objectives}
                onChange={(e) =>
                  setFormData({ ...formData, objectives: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    setFormData({ ...formData, grade: value })
                  }
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
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
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
                  value={formData.funElements}
                  onChange={(e) =>
                    setFormData({ ...formData, funElements: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lesson Duration</Label>
              <RadioGroup
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: value })
                }
                className="flex gap-4 flex-wrap"
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings">
              <AccordionTrigger>Additional Settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label>Curriculum Standards</Label>
                    <Select
                      value={formData.curriculum}
                      onValueChange={(value) =>
                        setFormData({ ...formData, curriculum: value })
                      }
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
                      selected={formData.learningTools}
                      onChange={(values) =>
                        setFormData({ ...formData, learningTools: values })
                      }
                      placeholder="Select learning tools..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Learning Needs</Label>
                    <MultiSelect
                      options={learningNeedsOptions}
                      selected={formData.learningNeeds}
                      onChange={(values) =>
                        setFormData({ ...formData, learningNeeds: values })
                      }
                      placeholder="Select learning needs..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lesson Activities</Label>
                    <MultiSelect
                      options={activitiesOptions}
                      selected={formData.activities}
                      onChange={(values) =>
                        setFormData({ ...formData, activities: values })
                      }
                      placeholder="Select lesson activities..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assessment Methods</Label>
                    <MultiSelect
                      options={assessmentOptions}
                      selected={formData.assessments}
                      onChange={(values) =>
                        setFormData({ ...formData, assessments: values })
                      }
                      placeholder="Select assessment methods..."
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button">
              Save Draft
            </Button>
            <Button type="submit">Create Lesson Plan</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LessonPlan;
