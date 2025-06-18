// src/components/feed/CommentsDialog.tsx
"use client";

import { useState } from "react";
import { type Post, type Comment } from "@/lib/types"; // Importamos Comment
import { useComments } from "@/hooks/useComments";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useFeed } from "@/hooks/useFeed";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react"; // Importamos el icono de papelera
import Image from "next/image";
import DeleteCommentAlert from "./DeleteCommentAlert"; // Importamos nuestra nueva alerta

const renderWithLinksAndHashtags = (text: string) => {
  const regex = /(#\w+|\bhttps?:\/\/\S+|\bwww\.\S+)/g;
  return text.split(regex).map((part, index) => {
    if (part.match(regex)) {
      if (part.startsWith("#")) {
        const tag = part.substring(1);
        return (
          <Link
            href={`/feed?tag=${tag}`}
            key={index}
            className="text-primary hover:underline"
          >
            {part}
          </Link>
        );
      } else {
        const href = part.startsWith("www.") ? `http://${part}` : part;
        return (
          <a
            href={href}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
    }
    return part;
  });
};

interface CommentsDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsDialog({
  post,
  isOpen,
  onOpenChange,
}: CommentsDialogProps) {
  const { user } = useAuthStore(); // <-- Necesitamos el user para comparar IDs
  const { data: comments, isLoading, error } = useComments(post.id);
  const { profile } = useProfile();
  const { createComment, isCreatingComment, deleteComment, isDeletingComment } =
    useFeed();
  const [newComment, setNewComment] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null); // Estado para la alerta

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment(
      { postId: post.id, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const handleDeleteComment = () => {
    if (!commentToDelete) return;
    deleteComment(
      { commentId: commentToDelete.id, postId: post.id },
      {
        onSuccess: () => {
          setCommentToDelete(null); // Cerramos la alerta al tener éxito
        },
      }
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Publicación de {post.profiles?.full_name}</DialogTitle>
            <DialogDescription>
              Viendo comentarios y respondiendo a esta publicación.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="pb-4 border-b">
                <p className="text-foreground whitespace-pre-wrap">
                  {renderWithLinksAndHashtags(post.content)}
                </p>
                {post.image_url && (
                  <div className="mt-4 relative aspect-video rounded-md overflow-hidden border">
                    <Image
                      src={post.image_url}
                      alt="Imagen del post"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
              {isLoading && (
                <p className="text-center">Cargando comentarios...</p>
              )}
              {error && (
                <p className="text-center text-destructive">
                  Error: {error.message}
                </p>
              )}

              {/* --- INICIO DE LA MODIFICACIÓN EN LA LISTA DE COMENTARIOS --- */}
              {comments &&
                comments.map((comment) => {
                  const isCommentAuthor = user?.id === comment.user_id;
                  return (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 group"
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage
                          src={comment.profiles?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {comment.profiles?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm w-full">
                        <p className="font-semibold text-foreground">
                          {comment.profiles?.full_name}
                        </p>
                        <p className="text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                      {isCommentAuthor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setCommentToDelete(comment)}
                          title="Eliminar comentario"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              {/* --- FIN DE LA MODIFICACIÓN --- */}
            </div>
            <div className="p-4 border-t bg-background">
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-2"
              >
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  placeholder="Escribe un comentario..."
                  className="flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isCreatingComment}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newComment.trim() || isCreatingComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Renderizamos la alerta de forma condicional */}
      {commentToDelete && (
        <DeleteCommentAlert
          isOpen={!!commentToDelete}
          onOpenChange={() => setCommentToDelete(null)}
          onConfirmDelete={handleDeleteComment}
          isDeleting={isDeletingComment}
        />
      )}
    </>
  );
}
