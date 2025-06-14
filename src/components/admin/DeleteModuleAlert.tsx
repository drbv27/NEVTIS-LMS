//src/components/admin/DeleteModuleAlert.tsx
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
            ¿Estás seguro de que quieres eliminar este módulo?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            módulo{" "}
            <span className="font-semibold text-destructive">
              {module.title}
            </span>
            , **junto con todas sus lecciones y archivos asociados**.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteModule({ moduleToDelete: module, courseId })}
            disabled={isDeletingModule}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingModule ? "Eliminando..." : "Sí, eliminar módulo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
