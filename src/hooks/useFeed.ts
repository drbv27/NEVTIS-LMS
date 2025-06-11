"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "./useProfile";
import { type Post, type PostAuthor } from "@/lib/types";
import { toast } from "sonner";

async function fetchPosts(): Promise<Post[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("posts")
    .select(`*, profiles ( id, full_name, avatar_url )`)
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
    mutationFn: async (newPostContent: string) => {
      if (!user) throw new Error("Usuario no autenticado.");

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("posts")
        .insert({ user_id: user.id, content: newPostContent })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (newPostContent: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      if (previousPosts && profile) {
        queryClient.setQueryData<Post[]>(
          ["posts"],
          [
            {
              id: `temp-${Date.now()}`,
              content: newPostContent,
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

  return { posts: posts || [], isLoading, error, createPost, isCreatingPost };
}
