// components/feed/DeletePostAlert.tsx
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
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu
            publicación de nuestros servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletePost(post.id)}
            disabled={isDeletingPost}
          >
            {isDeletingPost ? "Eliminando..." : "Continuar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
