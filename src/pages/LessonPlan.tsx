
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

interface LessonPlanForm {
  objectives: string;
  grade: string;
  subject: string;
  funElements: string;
  startTime: string;
  endTime: string;
  duration: string;
  curriculum: string[];
  learningTools: string[];
  learningNeeds: string[];
  activities: string[];
  assessments: string[];
}

const curriculumOptions = [
  { value: "common_core", label: "Common Core" },
  { value: "ngss", label: "NGSS" },
  { value: "state", label: "State Standards" },
];

const learningToolsOptions = [
  { value: "digital", label: "Digital Tools" },
  { value: "manipulatives", label: "Manipulatives" },
  { value: "visuals", label: "Visual Aids" },
];

const learningNeedsOptions = [
  { value: "visual", label: "Visual Learners" },
  { value: "auditory", label: "Auditory Learners" },
  { value: "kinesthetic", label: "Kinesthetic Learners" },
];

const activitiesOptions = [
  { value: "group", label: "Group Work" },
  { value: "individual", label: "Individual Work" },
  { value: "discussion", label: "Class Discussion" },
];

const assessmentOptions = [
  { value: "formative", label: "Formative Assessment" },
  { value: "summative", label: "Summative Assessment" },
  { value: "peer", label: "Peer Assessment" },
  { value: "self", label: "Self Assessment" },
];

const LessonPlan = () => {
  const [formData, setFormData] = useState<LessonPlanForm>({
    objectives: "",
    grade: "",
    subject: "",
    funElements: "",
    startTime: "",
    endTime: "",
    duration: "",
    curriculum: [],
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
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
                <Input
                  id="grade"
                  placeholder="e.g., 5th Grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 45"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings">
              <AccordionTrigger>Additional Settings</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label>Curriculum Standards</Label>
                    <MultiSelect
                      options={curriculumOptions}
                      selected={formData.curriculum}
                      onChange={(values) =>
                        setFormData({ ...formData, curriculum: values })
                      }
                      placeholder="Select curriculum standards..."
                    />
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
    </div>
  );
};

export default LessonPlan;
