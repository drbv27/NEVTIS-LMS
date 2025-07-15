// src/components/admin/DeleteLessonAlert.tsx
"use client";

import { useCourseMutations } from "@/hooks/useCourseMutations";
import { type Lesson } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteLessonAlertProps {
  lesson: Lesson;
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteLessonAlert({
  lesson,
  courseId,
  isOpen,
  onOpenChange,
}: DeleteLessonAlertProps) {
  const { deleteLesson, isDeletingLesson } = useCourseMutations();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            lesson{" "}
            <span className="font-semibold text-destructive">
              {lesson.title}
            </span>{" "}
            and its associated files.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteLesson({ lesson, courseId })}
            disabled={isDeletingLesson}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingLesson ? "Deleting..." : "Yes, delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
