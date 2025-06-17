// src/hooks/useFeed.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "./useProfile";
import { type Post } from "@/lib/types";
import { toast } from "sonner";

async function fetchPosts(): Promise<Post[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, content, image_url, created_at, likes_count, comments_count,
      profiles ( id, full_name, avatar_url )
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return data.map((post) => ({
    ...post,
    profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
  })) as Post[];
}

export function useFeed() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { profile } = useProfile();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
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
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error("Error subiendo imagen:", uploadError);
          throw new Error("No se pudo subir la imagen.");
        }

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // 1. Insertamos el post en la base de datos como antes
      const { data: newPostData, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);

      // --- INICIO DEL NUEVO CÓDIGO ---
      // 2. Si el post tiene contenido, llamamos a nuestra nueva función
      if (newPostData.content) {
        const { error: rpcError } = await supabase.rpc(
          "extract_and_link_hashtags",
          {
            post_id_param: newPostData.id,
            post_content_param: newPostData.content,
          }
        );

        if (rpcError) {
          // Si la función falla, lo mostramos en la consola, pero no detenemos el proceso
          // ya que el post principal ya se creó.
          console.error("Error procesando hashtags:", rpcError);
        }
      }
      // --- FIN DEL NUEVO CÓDIGO ---

      return newPostData;
    },
    onMutate: async (newPost: { content: string; imageFile: File | null }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
      if (previousPosts && profile) {
        queryClient.setQueryData<Post[]>(
          ["posts"],
          [
            {
              id: `temp-${Date.now()}`,
              content: newPost.content,
              created_at: new Date().toISOString(),
              profiles: {
                id: profile.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
              },
              likes_count: 0,
              comments_count: 0,
              image_url: null,
            },
            ...previousPosts,
          ]
        );
      }
      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData<Post[]>(["posts"], context.previousPosts);
      }
      toast.error(`Error al publicar: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
      const { error } = await supabase
        .from("posts")
        .update({ content: content, updated_at: new Date().toISOString() })
        .eq("id", postId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Post actualizado con éxito");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(`Error al actualizar: ${err.message}`),
  });
  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async (postId: string) => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Post eliminado");
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          ["posts"],
          previousPosts.filter((p) => p.id !== postId)
        );
      }
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData<Post[]>(["posts"], context.previousPosts);
      }
      toast.error(`Error al eliminar: ${err.message}`);
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
  };
}
