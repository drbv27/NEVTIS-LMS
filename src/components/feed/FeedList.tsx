// components/feed/FeedList.tsx
"use client";

import { useFeed } from "@/hooks/useFeed";
import CreatePostForm from "./CreatePostForm";
import PostCard from "./PostCard";
import { Newspaper } from "lucide-react";

export default function FeedList() {
  const { posts, isLoading, error } = useFeed();

  if (isLoading) {
    return (
      <p className="text-center py-10">Cargando el feed de la comunidad...</p>
    );
  }
  if (error) {
    return (
      <p className="text-center text-destructive py-10">
        Error al cargar el feed: {error.message}
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CreatePostForm />

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">Aún no hay publicaciones.</p>
          <p className="text-sm">¡Sé el primero en compartir algo!</p>
        </div>
      )}
    </div>
  );
}
