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
        onOpenChange(false); // Close the alert on successful deletion
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            category{" "}
            <span className="font-semibold text-destructive">
              {category.name}
            </span>
            . Courses associated with this category will not be deleted, but
            they will become uncategorized.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingCategory}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingCategory ? "Deleting..." : "Yes, permanently delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
