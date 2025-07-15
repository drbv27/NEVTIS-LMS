// src/components/feed/DeletePostAlert.tsx
"use client";

import { useFeed } from "@/hooks/useFeed";
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
import { Post } from "@/lib/types";

interface DeletePostAlertProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeletePostAlert({
  post,
  isOpen,
  onOpenChange,
}: DeletePostAlertProps) {
  const { deletePost, isDeletingPost } = useFeed();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletePost(post.id)}
            disabled={isDeletingPost}
          >
            {isDeletingPost ? "Deleting..." : "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
