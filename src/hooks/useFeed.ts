// Reemplaza todo el contenido de src/hooks/useFeed.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "./useProfile";
import { type Post, type Comment } from "@/lib/types"; // <-- Importamos Comment también
import { toast } from "sonner";

async function fetchPosts(tag: string | null): Promise<Post[]> {
  const supabase = createSupabaseBrowserClient();
  const baseSelect = `id, content, image_url, created_at, likes_count, comments_count, profiles!inner(*), likes(*), post_hashtags(hashtags(*)), comments!comments_post_id_fkey(*, profiles(*))`;
  let query;
  if (tag) {
    const filterSelect = baseSelect.replace(
      "post_hashtags(",
      "post_hashtags!inner("
    );
    query = supabase
      .from("posts")
      .select(filterSelect)
      .eq("post_hashtags.hashtags.name", tag.toLowerCase());
  } else {
    query = supabase.from("posts").select(baseSelect);
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("created_at", { foreignTable: "comments", ascending: false })
    .limit(3, { foreignTable: "comments" })
    .limit(20);
  if (error) {
    console.error("Error fetching posts:", error);
    throw new Error(error.message);
  }
  if (!data) return [];
  const transformedData = data
    .map((post) => {
      if (typeof post !== "object" || post === null) return null;
      const singleProfile = Array.isArray(post.profiles)
        ? post.profiles[0]
        : post.profiles;
      return { ...post, profiles: singleProfile || null };
    })
    .filter(Boolean);
  return transformedData as Post[];
}

export function useFeed(tag: string | null = null) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { profile } = useProfile();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["posts", tag],
    queryFn: () => fetchPosts(tag),
    enabled: !!user,
  });

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Debes iniciar sesión.");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.rpc("toggle_like", {
        post_id_param: postId,
      });
      if (error) {
        console.error("Error toggling like:", error);
        throw new Error("No se pudo procesar el 'me gusta'.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", tag] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const { mutate: createPost, isPending: isCreatingPost } = useMutation({
    mutationFn: async ({
      content,
      imageFile,
    }: {
      content: string;
      imageFile: File | null;
    }) => {
      if (!user) throw new Error("Usuario no autenticado.");
      const supabase = createSupabaseBrowserClient();
      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `<span class="math-inline">\{user\.id\}\-</span>{Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile);
        if (uploadError) {
          throw new Error("No se pudo subir la imagen.");
        }
        imageUrl = supabase.storage.from("post-images").getPublicUrl(fileName)
          .data.publicUrl;
      }
      const { data: newPostData, error: insertError } = await supabase
        .from("posts")
        .insert({ user_id: user.id, content: content, image_url: imageUrl })
        .select("*, profiles(*)")
        .single();
      if (insertError) {
        throw new Error(insertError.message);
      }
      if (newPostData.content) {
        await supabase.rpc("extract_and_link_hashtags", {
          post_id_param: newPostData.id,
          post_content_param: newPostData.content,
        });
      }
      return newPostData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", tag] });
      toast.success("¡Publicación creada con éxito!");
    },
    onError: (err) => {
      toast.error(`Error al publicar: ${err.message}`);
    },
  });
  const { mutate: createComment, isPending: isCreatingComment } = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      if (!user) throw new Error("Debes iniciar sesión para comentar.");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("comments")
        .insert({ post_id: postId, user_id: user.id, content: content });
      if (error) {
        console.error("Error creating comment:", error);
        throw new Error("No se pudo publicar el comentario.");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts", tag] });
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      toast.success("Comentario añadido con éxito");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // --- INICIO DEL NUEVO CÓDIGO ---
  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    // 1. La mutación ahora espera un objeto con el ID del comentario Y el ID del post
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: number;
      postId: string;
    }) => {
      if (!user)
        throw new Error("Debes iniciar sesión para borrar comentarios.");

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        throw new Error("No se pudo borrar el comentario.");
      }
    },
    // 2. Usamos el segundo argumento 'variables' en onSuccess, que contiene lo que le pasamos a la mutación.
    //    Ya no necesitamos el 'context' que causaba el error.
    onSuccess: (_, variables) => {
      // Invalidamos ambas cachés para que todo se actualice
      queryClient.invalidateQueries({ queryKey: ["posts", tag] });
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      toast.success("Comentario eliminado");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  // --- FIN DEL NUEVO CÓDIGO ---

  const { mutate: updatePost, isPending: isUpdatingPost } = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("posts").update({ content }).eq("id", postId);
    },
  });
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async (postId: string) => {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("posts").delete().eq("id", postId);
    },
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    createPost,
    isCreatingPost,
    updatePost,
    isUpdatingPost,
    deletePost,
    isDeletingPost,
    toggleLike,
    isLiking,
    createComment,
    isCreatingComment,
    deleteComment,
    isDeletingComment, // <-- Exportamos la nueva mutación
  };
}
