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
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            question and all of its options.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingQuestion}
            asChild
          >
            <Button variant="destructive">
              {isDeletingQuestion ? "Deleting..." : "Yes, delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
