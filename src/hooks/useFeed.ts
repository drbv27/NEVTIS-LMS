// Reemplaza todo el contenido de src/hooks/useFeed.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "./useProfile";
import { type Post } from "@/lib/types";
import { toast } from "sonner";

async function fetchPosts(tag: string | null): Promise<Post[]> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("posts")
    .select(
      `
      id, content, image_url, created_at, likes_count, comments_count,
      profiles(*),
      likes(*),
      post_hashtags(hashtags(*))
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (tag) {
    // Para el filtrado, necesitamos una consulta diferente que asegure el INNER JOIN
    query = supabase
      .from("posts")
      .select(
        `
        id, content, image_url, created_at, likes_count, comments_count,
        profiles(*),
        likes(*),
        post_hashtags!inner(hashtags!inner(*))
        `
      )
      .eq("post_hashtags.hashtags.name", tag.toLowerCase());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  // --- INICIO DE LA CORRECCIÓN DEFENSIVA ---
  // Este bloque es la clave para solucionar los errores de TypeScript y de la UI.
  const transformedData = data
    .map((post: any) => {
      // Aceptamos 'any' temporalmente para inspeccionar
      // 1. Nos aseguramos de que el post es un objeto válido antes de continuar
      if (typeof post !== "object" || post === null) {
        return null;
      }

      // 2. Desenvolvemos el array de 'profiles' para obtener un solo objeto
      const singleProfile = Array.isArray(post.profiles)
        ? post.profiles[0]
        : post.profiles;

      // 3. Devolvemos el objeto con la forma correcta que espera nuestro tipo 'Post'
      return {
        ...post,
        profiles: singleProfile || null,
      };
    })
    .filter(Boolean); // 4. Eliminamos cualquier resultado nulo del paso anterior

  return transformedData as Post[];
  // --- FIN DE LA CORRECCIÓN DEFENSIVA ---
}

// El resto del hook no necesita cambios, pero lo incluyo para que tengas el archivo completo.
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
  };
}
