//src/hooks/useFeed.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "./useProfile";
import { type Post } from "@/lib/types";
import { toast } from "sonner";

// Definimos los tipos de feed que podemos solicitar
export type FeedType = "global" | "following";

// 1. La función ahora acepta un parámetro para saber qué vista consultar
async function fetchPosts(
  tag: string | null,
  feedType: FeedType
): Promise<Post[]> {
  const supabase = createSupabaseBrowserClient();

  // 2. Determinamos de qué vista vamos a seleccionar los datos
  const fromView =
    feedType === "following" ? "followed_posts_view" : "posts_with_details";

  let query;

  // El `select` es el mismo, ya que ambas vistas tienen la misma estructura
  const baseSelect = `
    *,
    comments!comments_post_id_fkey(*, profiles(*)),
    post_hashtags(hashtags!inner(*))
  `;

  if (tag) {
    const filterSelect = baseSelect.replace(
      "post_hashtags(",
      "post_hashtags!inner("
    );
    // 3. Apuntamos a la vista correcta
    query = supabase
      .from(fromView)
      .select(filterSelect)
      .eq("post_hashtags.hashtags.name", tag.toLowerCase());
  } else {
    // 3. Apuntamos a la vista correcta
    query = supabase.from(fromView).select(baseSelect);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("created_at", { foreignTable: "comments", ascending: false })
    .limit(3, { foreignTable: "comments" })
    .limit(20);

  if (error) {
    console.error(`Error fetching posts from view '${fromView}':`, error);
    throw new Error(error.message);
  }

  return (data as Post[]) || [];
}

// 4. El hook ahora acepta el `feedType` y lo pasa a la función de fetch
export function useFeed(
  tag: string | null = null,
  feedType: FeedType = "global"
) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { profile } = useProfile();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[], Error>({
    // 5. La queryKey ahora incluye el `feedType` y el `tag`.
    // Esto es crucial para que React Query cachee los feeds de forma separada.
    queryKey: ["posts", feedType, tag],
    queryFn: () => fetchPosts(tag, feedType),
    enabled: !!user,
  });

  // --- LAS MUTACIONES NO NECESITAN CAMBIOS, PERO SE AJUSTA LA INVALIDACIÓN ---

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Debes iniciar sesión.");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.rpc("toggle_like", {
        post_id_param: postId,
      });
      if (error) throw new Error("No se pudo procesar el 'me gusta'.");
    },
    onSuccess: () => {
      // Invalida ambas vistas para mantener la consistencia
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err.message),
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
      if (error) throw new Error("No se pudo publicar el comentario.");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      toast.success("Comentario añadido con éxito");
    },
    onError: (err) => toast.error(err.message),
  });

  // Las mutaciones de crear, editar y borrar post no necesitan cambios
  // ya que invalidan la queryKey 'posts' de forma general, lo que refrescará
  // cualquier vista activa del feed.
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
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
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
        .select("id, content")
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
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("¡Publicación creada con éxito!");
    },
    onError: (err) => {
      toast.error(`Error al publicar: ${err.message}`);
    },
  });

  const { mutate: updatePost, isPending: isUpdatingPost } = useMutation({
    // ...código de la mutación sin cambios
  });
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    // ...código de la mutación sin cambios
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
  };
}
