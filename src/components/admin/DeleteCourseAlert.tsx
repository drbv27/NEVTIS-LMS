// src/components/admin/DeleteCourseAlert.tsx
"use client";

import { useCourseMutations } from "@/hooks/useCourseMutations";
import { type Course } from "@/lib/types";
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

interface DeleteCourseAlertProps {
  course: Course;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteCourseAlert({
  course,
  isOpen,
  onOpenChange,
}: DeleteCourseAlertProps) {
  const { deleteCourse, isDeletingCourse } = useCourseMutations();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            course{" "}
            <span className="font-semibold text-destructive">
              {course.title}
            </span>
            , along with{" "}
            <strong>
              all of its associated modules, lessons, files, and enrollment data
            </strong>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteCourse(course)}
            disabled={isDeletingCourse}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingCourse ? "Deleting..." : "Yes, permanently delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
