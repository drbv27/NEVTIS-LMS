// src/components/admin/DeleteUserAlert.tsx
"use client";

import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import { type Profile } from "@/lib/types";
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

interface DeleteUserAlertProps {
  user: Profile;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteUserAlert({
  user,
  isOpen,
  onOpenChange,
}: DeleteUserAlertProps) {
  const { deleteUser, isDeletingUser } = useAdminUserMutations();

  const handleDelete = () => {
    deleteUser(
      { userIdToDelete: user.id },
      {
        onSuccess: () => {
          onOpenChange(false); // Close the alert on successful deletion
        },
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user{" "}
            <span className="font-semibold text-destructive">
              {user.full_name} ({user.id})
            </span>
            . Their authentication account, profile, enrollments, and all
            associated content will be erased.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingUser}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingUser ? "Deleting..." : "Yes, permanently delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
