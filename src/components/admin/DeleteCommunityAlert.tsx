// src/components/admin/DeleteCommunityAlert.tsx
"use client";

import { useAdminCommunityMutations } from "@/hooks/useAdminCommunityMutations";
import { type Community } from "@/lib/types";
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

interface DeleteCommunityAlertProps {
  community: Community;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteCommunityAlert({
  community,
  isOpen,
  onOpenChange,
}: DeleteCommunityAlertProps) {
  const { deleteCommunity, isDeletingCommunity } = useAdminCommunityMutations();

  const handleDelete = () => {
    // Warning: Cascading delete will also remove all associated courses and posts.
    // It's crucial that the user understands this.
    deleteCommunity(
      { id: community.id, image_url: community.image_url },
      {
        onSuccess: () => {
          onOpenChange(false); // Close the alert on successful deletion
        },
        onError: (error) => {
          console.error("Error deleting community:", error);
          // The error toast is already handled by the hook, but extra logic could be added here if needed.
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
            This action cannot be undone. This will permanently delete the
            community{" "}
            <span className="font-semibold text-destructive">
              {community.name}
            </span>
            . All associated **courses and posts** will also be permanently
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingCommunity}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingCommunity ? "Deleting..." : "Yes, permanently delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
