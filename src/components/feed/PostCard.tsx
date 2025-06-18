// src/components/feed/PostCard.tsx
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFeed } from "@/hooks/useFeed";
import { useProfile } from "@/hooks/useProfile";
import { type Post } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  ThumbsUp,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
} from "lucide-react";
import EditPostDialog from "./EditPostDialog";
import DeletePostAlert from "./DeletePostAlert";
import { Input } from "../ui/input";
import CommentsDialog from "./CommentsDialog"; // <-- 1. IMPORTAMOS EL NUEVO DIÁLOGO

// ... (las funciones timeAgo y renderWithLinksAndHashtags no cambian)
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
  return "hace unos segundos";
}
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

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();
  const { profile } = useProfile();
  const { toggleLike, isLiking, createComment, isCreatingComment } = useFeed();
  const isAuthor = user?.id === post.profiles?.id;
  const isLikedByMe =
    post.likes && post.likes.some((like) => like.user_id === user?.id);

  const [comment, setComment] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); // <-- 2. NUEVO ESTADO PARA EL DIÁLOGO

  // ... la función handleCommentSubmit no la necesitamos aquí por ahora ...

  return (
    <>
      <Card className="overflow-hidden shadow-md">
        <CardHeader className="p-4 sm:p-6">
          {/* ... Header ... */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src={post.profiles?.avatar_url || undefined}
                  alt={post.profiles?.full_name || "Avatar"}
                />
                <AvatarFallback>
                  {post.profiles?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {post.profiles?.full_name || "Usuario Anónimo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(post.created_at)}
                </p>
              </div>
            </div>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
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

          {/* 3. YA NO MOSTRAMOS LOS COMENTARIOS AQUÍ DIRECTAMENTE */}
        </CardContent>
        <CardFooter className="p-2 sm:p-3 flex justify-around border-t bg-muted/50">
          {/* ... Botón de Me Gusta ... */}
          <Button
            variant="ghost"
            size="sm"
            className={`w-full transition-colors ${
              isLikedByMe ? "text-[#FF8C61]" : "text-muted-foreground"
            } hover:text-primary`}
            onClick={() => toggleLike(post.id)}
            disabled={isLiking}
          >
            <ThumbsUp
              className="mr-2 h-4 w-4"
              fill={isLikedByMe ? "#FF8C61" : "none"}
            />
            ({post.likes_count}) Me gusta
          </Button>

          {/* 4. EL BOTÓN DE COMENTAR AHORA ABRE EL DIÁLOGO */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full"
            onClick={() => setIsCommentsOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> ({post.comments_count})
            Comentar
          </Button>

          {/* ... Botón de Compartir ... */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full"
          >
            <Share2 className="mr-2 h-4 w-4" /> Compartir
          </Button>
        </CardFooter>
      </Card>

      {/* 5. RENDERIZAMOS NUESTRO DIÁLOGO Y LE PASAMOS EL ESTADO */}
      <CommentsDialog
        post={post}
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
      />

      {isAuthor && (
        <>
          <EditPostDialog
            post={post}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
          <DeletePostAlert
            post={post}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
}
