// src/components/admin/DeleteCategoryAlert.tsx
"use client";

import { useAdminCategoryMutations } from "@/hooks/useAdminCategoryMutations";
import { type Category } from "@/lib/types";
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

interface DeleteCategoryAlertProps {
  category: Category;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteCategoryAlert({
  category,
  isOpen,
  onOpenChange,
}: DeleteCategoryAlertProps) {
  const { deleteCategory, isDeletingCategory } = useAdminCategoryMutations();

  const handleDelete = () => {
    deleteCategory(category.id, {
      onSuccess: () => {
        onOpenChange(false); // Cierra la alerta si la eliminación es exitosa
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            categoría{" "}
            <span className="font-semibold text-destructive">
              {category.name}
            </span>
            . Los cursos asociados a esta categoría no se eliminarán, pero
            quedarán sin categoría.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingCategory}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingCategory
              ? "Eliminando..."
              : "Sí, eliminar permanentemente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
