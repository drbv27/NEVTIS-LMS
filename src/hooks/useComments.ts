// src/hooks/useComments.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Comment } from "@/lib/types"; // Usamos nuestro tipo Comment ya definido

// Esta función obtiene todos los comentarios para un post específico
async function fetchComments(postId: string): Promise<Comment[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
        *,
        profiles!inner(*)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true }); // Los comentarios se ordenan del más antiguo al más nuevo

  if (error) {
    console.error("Error fetching comments:", error);
    throw new Error("No se pudieron cargar los comentarios.");
  }

  // La transformación para 'profiles' que ya conocemos
  const transformedData = data.map((comment) => ({
    ...comment,
    profiles: Array.isArray(comment.profiles)
      ? comment.profiles[0]
      : comment.profiles,
  }));

  return transformedData as Comment[];
}

// El hook personalizado que envuelve la lógica de fetching
export function useComments(postId: string | null) {
  return useQuery<Comment[], Error>({
    // La queryKey incluye el postId para que cada post tenga su propia caché de comentarios
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId!),
    // El hook solo se activará si le pasamos un postId válido
    enabled: !!postId,
  });
}
