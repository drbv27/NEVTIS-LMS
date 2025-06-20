// src/components/feed/FeedList.tsx
"use client";

import { useSearchParams } from "next/navigation"; // <-- 1. IMPORTAMOS useSearchParams
import { useFeed } from "@/hooks/useFeed";
import CreatePostForm from "./CreatePostForm";
import PostCard from "./PostCard";
import { Newspaper, Tag } from "lucide-react"; // <-- 2. AÑADIMOS EL ICONO DE TAG

export default function FeedList() {
  // 3. LEEMOS LOS PARÁMETROS DE LA URL
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");

  // 4. LE PASAMOS EL TAG (O NULL SI NO HAY) A NUESTRO HOOK
  const { posts, isLoading, error } = useFeed(tag);

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
      {/* 5. SI NO ESTAMOS FILTRANDO, MOSTRAMOS EL FORMULARIO DE CREACIÓN */}
      {!tag && <CreatePostForm />}

      {/* 6. AÑADIMOS UN TÍTULO DINÁMICO */}
      {tag && (
        <div className="mb-8 p-4 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-bold flex items-center">
            <Tag className="mr-3 h-6 w-6 text-primary" />
            Mostrando posts con #{tag}
          </h2>
        </div>
      )}

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
              : "¡Sé el primero en compartir algo!"}
          </p>
        </div>
      )}
    </div>
  );
}
