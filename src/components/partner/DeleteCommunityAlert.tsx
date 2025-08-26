// src/components/partner/DeleteCommunityAlert.tsx
"use client";

import { usePartnerCommunityMutations } from "@/hooks/usePartnerCommunityMutations";
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
  const { deleteCommunity, isDeletingCommunity } =
    usePartnerCommunityMutations();

  const handleDelete = () => {
    deleteCommunity(
      { id: community.id },
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
            This action cannot be undone. This will permanently delete the
            community{" "}
            <span className="font-semibold text-destructive">
              {community.name}
            </span>
            , along with **all of its associated courses and files**.
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
