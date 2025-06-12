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
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará el curso{" "}
            <span className="font-semibold text-destructive">
              {course.title}
            </span>
            , junto con todos sus módulos, lecciones y datos de inscripción
            asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteCourse(course)}
            disabled={isDeletingCourse}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingCourse ? "Eliminando..." : "Sí, eliminar curso"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
