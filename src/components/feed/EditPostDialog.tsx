//src/components/feed/EditPostDialog.tsx
"use client";

import { useState } from "react";
import { useFeed } from "@/hooks/useFeed";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // <-- 1. Importamos el componente de descripción
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/lib/types";

interface EditPostDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPostDialog({
  post,
  isOpen,
  onOpenChange,
}: EditPostDialogProps) {
  const [content, setContent] = useState(post.content);
  const { updatePost, isUpdatingPost } = useFeed();

  const handleUpdate = () => {
    if (!content.trim()) return;
    updatePost(
      { postId: post.id, content },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Publicación</DialogTitle>
          {/* --- INICIO DE LA CORRECCIÓN --- */}
          {/* 2. Añadimos una descripción clara para la accesibilidad */}
          <DialogDescription>
            Realiza los cambios en tu publicación. Haz clic en "Guardar Cambios"
            cuando termines.
          </DialogDescription>
          {/* --- FIN DE LA CORRECCIÓN --- */}
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="my-4"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isUpdatingPost}>
            {isUpdatingPost ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
