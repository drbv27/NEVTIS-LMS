//src/hooks/useFeed.ts
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type Post } from "@/lib/types";
import { toast } from "sonner";

export type FeedType = "global" | "following";
const POSTS_PER_PAGE = 5;

type LikeMutationContext = {
  previousPosts?: InfiniteData<{
    posts: Post[];
    nextCursor: number | undefined;
  }>;
};

interface CreatePostPayload {
  content: string;
  imageFile: File | null;
  communityId: string;
}

// NUEVO: Definimos el payload para borrar un comentario
interface DeleteCommentPayload {
  commentId: number;
  postId: string; // Necesario para invalidar la caché del post
}

async function fetchPosts({
  tag,
  feedType,
  pageParam = 0,
  activeCommunityId,
}: {
  tag: string | null;
  feedType: FeedType;
  pageParam: number;
  activeCommunityId: string | null;
}) {
  // ... (código de fetchPosts sin cambios)
  if (!activeCommunityId) {
    return { posts: [], nextCursor: undefined };
  }

  const supabase = createSupabaseBrowserClient();
  const fromView =
    feedType === "following" ? "followed_posts_view" : "posts_with_details";

  const from = pageParam * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query;
  const baseSelect = `*, comments!comments_post_id_fkey(*, profiles(*)), post_hashtags(hashtags!inner(*))`;

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

  query = query.eq("community_id", activeCommunityId);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("created_at", { foreignTable: "comments", ascending: false })
    .limit(3, { foreignTable: "comments" })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    posts: (data as Post[]) || [],
    nextCursor: data.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
  };
}

// NUEVO: Función asíncrona para eliminar un comentario
async function deleteCommentFn({ commentId }: DeleteCommentPayload) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  if (error) {
    throw new Error(`Error al eliminar el comentario: ${error.message}`);
  }
}

export function useFeed(
  tag: string | null = null,
  feedType: FeedType = "global"
) {
  const queryClient = useQueryClient();
  const { user, activeCommunityId } = useAuthStore();
  const queryKey = ["posts", feedType, tag, activeCommunityId];

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // ... (código de useInfiniteQuery sin cambios)
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchPosts({ tag, feedType, pageParam, activeCommunityId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user && !!activeCommunityId,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const { mutate: toggleLike, isPending: isLiking } = useMutation<
    void,
    Error,
    string,
    LikeMutationContext
  >({
    // ... (código de toggleLike sin cambios)
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Debes iniciar sesión.");
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.rpc("toggle_like", {
        post_id_param: postId,
      });
      if (error) {
        console.error("--- ERROR DETALLADO DE LA BASE DE DATOS ---", error);
        throw new Error(`Error de base de datos: ${error.message}`);
      }
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousPosts =
        queryClient.getQueryData<
          InfiniteData<{ posts: Post[]; nextCursor: number | undefined }>
        >(queryKey);
      queryClient.setQueryData<
        InfiniteData<{ posts: Post[]; nextCursor: number | undefined }>
      >(queryKey, (oldData) => {
        if (!oldData) return oldData;
        const newPages = oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) => {
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
      return { previousPosts };
    },
    onError: (err, postId, context) => {
      toast.error(err.message);
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const { mutate: createPost, isPending: isCreatingPost } = useMutation({
    // ... (código de createPost sin cambios)
    mutationFn: async ({
      content,
      imageFile,
      communityId,
    }: CreatePostPayload) => {
      if (!user) throw new Error("Usuario no autenticado.");
      if (!communityId)
        throw new Error("Se requiere una comunidad para publicar.");

      const supabase = createSupabaseBrowserClient();
      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile);
        if (uploadError) throw new Error("No se pudo subir la imagen.");
        imageUrl = supabase.storage.from("post-images").getPublicUrl(fileName)
          .data.publicUrl;
      }

      const { data: newPostData, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content,
          image_url: imageUrl,
          community_id: communityId,
        })
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
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(`Error al publicar: ${err.message}`);
    },
  });

  const { mutate: createComment, isPending: isCreatingComment } = useMutation({
    // ... (código de createComment sin cambios)
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

  const { mutate: updatePost, isPending: isUpdatingPost } = useMutation({
    // ... (código de updatePost sin cambios)
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
    // ... (código de deletePost sin cambios)
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

  // NUEVO: Añadimos la mutación para eliminar un comentario
  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation<
    void,
    Error,
    DeleteCommentPayload
  >({
    mutationFn: deleteCommentFn,
    onSuccess: (_, variables) => {
      toast.success("Comentario eliminado.");
      // Invalidamos la query de comentarios y la de posts (para el contador)
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
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
    // NUEVO: Exportamos las funciones de borrado de comentarios
    deleteComment,
    isDeletingComment,
  };
}
