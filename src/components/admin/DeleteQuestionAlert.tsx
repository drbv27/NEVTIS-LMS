// src/components/admin/DeleteQuestionAlert.tsx
"use client";

import { useQuizMutations } from "@/hooks/useQuizMutations";
import { type QuizQuestion } from "@/hooks/useQuizEditor";
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
import { Button } from "../ui/button";

interface DeleteQuestionAlertProps {
  question: QuizQuestion;
  lessonId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteQuestionAlert({
  question,
  lessonId,
  isOpen,
  onOpenChange,
}: DeleteQuestionAlertProps) {
  const { deleteQuestion, isDeletingQuestion } = useQuizMutations();

  const handleDelete = () => {
    deleteQuestion(
      { questionId: question.id, lessonId },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente esta
            pregunta y todas sus opciones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingQuestion}
            asChild
          >
            <Button variant="destructive">
              {isDeletingQuestion ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
