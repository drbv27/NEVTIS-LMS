// src/hooks/useFeed.ts
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type Post } from "@/lib/types";
import { toast } from "sonner";

export type FeedType = "global" | "following";
const POSTS_PER_PAGE = 5;

async function fetchPosts({
  tag,
  feedType,
  pageParam = 0,
}: {
  tag: string | null;
  feedType: FeedType;
  pageParam: number;
}) {
  const supabase = createSupabaseBrowserClient();
  const fromView =
    feedType === "following" ? "followed_posts_view" : "posts_with_details";

  const from = pageParam * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query;
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
    query = supabase
      .from(fromView)
      .select(filterSelect)
      .eq("post_hashtags.hashtags.name", tag.toLowerCase());
  } else {
    query = supabase.from(fromView).select(baseSelect);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("created_at", { foreignTable: "comments", ascending: false })
    .limit(3, { foreignTable: "comments" })
    .range(from, to);

  if (error) {
    console.error(`Error fetching posts from view '${fromView}':`, error);
    throw new Error(error.message);
  }

  return {
    posts: (data as Post[]) || [],
    nextCursor: data.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
  };
}

export function useFeed(
  tag: string | null = null,
  feedType: FeedType = "global"
) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // --- INICIO DE LA CORRECCIÓN ---
  // 1. DESTRUCTURAMOS EL `isLoading` QUE NOS DA EL HOOK DIRECTAMENTE
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading, // <-- ESTE ES EL `isLoading` CORRECTO
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", feedType, tag],
    queryFn: ({ pageParam }) => fetchPosts({ tag, feedType, pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
  });
  // --- FIN DE LA CORRECCIÓN ---

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // --- LAS MUTACIONES PERMANECEN IGUAL ---
  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Debes iniciar sesión.");
      const supabase = createSupabaseBrowserClient();
      // La llamada a la base de datos no cambia
      const { error } = await supabase.rpc("toggle_like", {
        post_id_param: postId,
      });
      if (error) {
        // Si hay un error, lo lanzamos para que se active el onError
        throw new Error("No se pudo procesar el 'me gusta'.");
      }
    },
    // onMutate se ejecuta ANTES de la mutación. Aquí es donde hacemos la magia.
    onMutate: async (postId: string) => {
      // 1. Cancelamos cualquier re-fetch pendiente para que no sobreescriba nuestra actualización optimista.
      await queryClient.cancelQueries({ queryKey: ["posts", feedType, tag] });

      // 2. Guardamos una instantánea del estado anterior por si necesitamos revertir.
      const previousPosts = queryClient.getQueryData(["posts", feedType, tag]);

      // 3. Actualizamos la caché de forma optimista.
      queryClient.setQueryData(["posts", feedType, tag], (oldData: any) => {
        // Buscamos el post específico y cambiamos su estado de "like"
        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((post: Post) => {
            if (post.id === postId) {
              return {
                ...post,
                is_liked_by_me: !post.is_liked_by_me,
                likes_count: post.is_liked_by_me
                  ? post.likes_count - 1
                  : post.likes_count + 1,
              };
            }
            return post;
          }),
        }));

        return { ...oldData, pages: newPages };
      });

      // 4. Devolvemos el contexto con la instantánea para usarla en onError.
      return { previousPosts };
    },
    // onError se ejecuta si la mutación falla.
    onError: (err, postId, context) => {
      toast.error("Error al dar 'me gusta'. Reintentando...");
      // 5. Si hubo un error, revertimos la caché al estado anterior.
      if (context?.previousPosts) {
        queryClient.setQueryData(
          ["posts", feedType, tag],
          context.previousPosts
        );
      }
    },
    // onSettled se ejecuta siempre, ya sea con éxito o error.
    onSettled: () => {
      // 6. Volvemos a pedir los datos del servidor para asegurarnos de que la UI
      // esté perfectamente sincronizada con la base de datos.
      queryClient.invalidateQueries({ queryKey: ["posts", feedType, tag] });
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

  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: number;
      postId: string;
    }) => {
      if (!user) throw new Error("No autenticado.");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error("No se pudo eliminar el comentario.");
      }
    },
    onSuccess: (_, variables) => {
      toast.success("Comentario eliminado.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
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
        .select("id, content")
        .single();
      if (insertError) throw new Error(insertError.message);
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
      const { error } = await supabase
        .from("posts")
        .update({ content })
        .eq("id", postId);
      if (error) throw new Error("Error al actualizar el post.");
    },
    onSuccess: () => {
      toast.success("Publicación actualizada.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
    mutationFn: async (postId: string) => {
      const supabase = createSupabaseBrowserClient();
      const { data: postData } = await supabase
        .from("posts")
        .select("image_url")
        .eq("id", postId)
        .single();

      if (postData?.image_url) {
        const fileName = postData.image_url.split("/").pop();
        if (fileName) {
          await supabase.storage.from("post-images").remove([fileName]);
        }
      }

      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw new Error("No se pudo eliminar la publicación.");
    },
    onSuccess: () => {
      toast.success("Publicación eliminada.");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    posts,
    error,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
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
    isDeletingComment,
  };
}
