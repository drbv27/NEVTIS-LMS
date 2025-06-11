// components/feed/PostCard.tsx
"use client";

import { type Post } from "@/lib/types";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, Share2 } from "lucide-react";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " años";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " días";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutos";
  return "hace unos segundos";
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden shadow-md">
      <CardHeader className="p-4 sm:p-6">
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
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
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
      </CardContent>
      <CardFooter className="p-2 sm:p-3 border-t bg-muted/50 flex justify-around">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary w-full"
        >
          <ThumbsUp className="mr-2 h-4 w-4" /> ({post.likes_count}) Me gusta
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary w-full"
        >
          <MessageCircle className="mr-2 h-4 w-4" /> ({post.comments_count})
          Comentar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary w-full"
        >
          <Share2 className="mr-2 h-4 w-4" /> Compartir
        </Button>
      </CardFooter>
    </Card>
  );
}
