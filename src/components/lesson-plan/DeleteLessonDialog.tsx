
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteLessonDialogProps {
  lessonId: string;
}

const DeleteLessonDialog = ({ lessonId }: DeleteLessonDialogProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!lessonId || isDeleting) return;

    setIsDeleting(true);
    
    try {
      const { error: activitiesError } = await supabase
        .from('activities_detail')
        .delete()
        .eq('lesson_id', lessonId);

      if (activitiesError) {
        console.error('Error deleting activities:', activitiesError);
        throw new Error('Failed to delete activities');
      }

      const { error: lessonsError } = await supabase
        .from('lessons')
        .delete()
        .eq('response_id', lessonId);

      if (lessonsError) {
        console.error('Error deleting lessons:', lessonsError);
        throw new Error('Failed to delete lessons');
      }

      const { error: lessonPlanError } = await supabase
        .from('lesson_plans')
        .delete()
        .eq('id', lessonId);

      if (lessonPlanError) {
        console.error('Error deleting lesson plan:', lessonPlanError);
        throw new Error('Failed to delete lesson plan');
      }

      toast.success("Lesson plan and all related items deleted successfully");
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error during deletion:', error);
      toast.error("Failed to delete lesson plan and related items");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="flex items-center gap-2"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {isDeleting ? "Deleting..." : "Delete Lesson Plan"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete Lesson Plan
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this lesson plan
            and all associated activities, lessons, and related content.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLessonDialog;
