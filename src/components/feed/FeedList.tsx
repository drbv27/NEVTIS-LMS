// src/components/feed/FeedList.tsx
"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFeed, type FeedType } from "@/hooks/useFeed";
import CreatePostForm from "./CreatePostForm";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Newspaper, Rss, Tag } from "lucide-react";
import PostCardSkeleton from "./PostCardSkeleton"; // 1. IMPORTAMOS el nuevo esqueleto

export default function FeedList() {
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");
  const [feedType, setFeedType] = useState<FeedType>("global");

  const { posts, isLoading, error } = useFeed(tag, feedType);
  const activeFeedType = tag ? "global" : feedType;

  // 2. CAMBIAMOS LA LÓGICA DE CARGA
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-8">
        {/* Mostramos 3 esqueletos para simular la carga del contenido */}
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
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
      {!tag ? (
        <>
          <div className="mb-6">
            <div className="sm:hidden">
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                onChange={(e) => setFeedType(e.target.value as FeedType)}
                value={activeFeedType}
              >
                <option value="global">Comunidad</option>
                <option value="following">Siguiendo</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  <button
                    onClick={() => setFeedType("global")}
                    className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFeedType === "global"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                    }`}
                  >
                    <Newspaper className="mr-2 h-5 w-5" />
                    <span>Comunidad</span>
                  </button>
                  <button
                    onClick={() => setFeedType("following")}
                    className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFeedType === "following"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                    }`}
                  >
                    <Rss className="mr-2 h-5 w-5" />
                    <span>Siguiendo</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
          {activeFeedType === "global" && <CreatePostForm />}
        </>
      ) : (
        <div className="mb-8 p-4 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-bold flex items-center">
            <Tag className="mr-3 h-6 w-6 text-primary" />
            Mostrando posts con #{tag}
          </h2>
        </div>
      )}

      <div className="mt-8">
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
            <p className="text-sm">
              {tag
                ? `Nadie ha hablado de #${tag} todavía.`
                : activeFeedType === "following"
                ? "Sigue a otros usuarios para ver sus publicaciones aquí."
                : "¡Sé el primero en compartir algo!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
