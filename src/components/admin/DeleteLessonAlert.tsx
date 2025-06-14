//src/components/admin/DeleteLessonAlert.tsx
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
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            lección{" "}
            <span className="font-semibold text-destructive">
              {lesson.title}
            </span>{" "}
            y sus archivos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteLesson({ lesson, courseId })} // <-- Pasamos el objeto 'lesson' completo
            disabled={isDeletingLesson}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingLesson ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
