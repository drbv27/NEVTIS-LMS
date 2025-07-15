// src/components/admin/DeleteModuleAlert.tsx
"use client";

import { useCourseMutations } from "@/hooks/useCourseMutations";
import { type Module } from "@/lib/types";
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

interface DeleteModuleAlertProps {
  module: Module;
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteModuleAlert({
  module,
  courseId,
  isOpen,
  onOpenChange,
}: DeleteModuleAlertProps) {
  const { deleteModule, isDeletingModule } = useCourseMutations();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this module?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            module{" "}
            <span className="font-semibold text-destructive">
              {module.title}
            </span>
            ,{" "}
            <strong>along with all of its associated lessons and files</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteModule({ moduleToDelete: module, courseId })}
            disabled={isDeletingModule}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingModule ? "Deleting..." : "Yes, delete module"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
