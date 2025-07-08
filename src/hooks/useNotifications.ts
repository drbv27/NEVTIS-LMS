// src/hooks/useNotifications.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

// Definimos la forma que tendrán nuestras notificaciones en el frontend
export interface Notification {
  id: string;
  is_read: boolean;
  type: "new_like" | "new_comment";
  created_at: string;
  post_id: string;
  actor_id: string;
  actor_name: string | null;
  actor_avatar_url: string | null;
  post_content_preview: string | null;
}

// La función que obtiene las notificaciones y el conteo de no leídas
async function fetchNotifications(
  userId: string | undefined
): Promise<{ notifications: Notification[]; unread_count: number }> {
  if (!userId) return { notifications: [], unread_count: 0 };

  const supabase = createSupabaseBrowserClient();

  // Hacemos una llamada a una RPC que nos devolverá todo lo que necesitamos
  const { data, error } = await supabase.rpc("get_user_notifications");

  if (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("No se pudieron cargar las notificaciones.");
  }

  const unread_count = data.filter((n: Notification) => !n.is_read).length;

  return { notifications: data, unread_count };
}

export function useNotifications() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", user?.id];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchNotifications(user?.id),
    enabled: !!user,
    // Refrescamos las notificaciones cada minuto
    refetchInterval: 60000,
  });

  // Mutación para marcar todas las notificaciones como leídas
  const { mutate: markAllAsRead, isPending: isMarkingAsRead } = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error)
        throw new Error(
          "No se pudieron marcar las notificaciones como leídas."
        );
    },
    onSuccess: () => {
      // Invalidamos la query para que la UI se actualice inmediatamente
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    error,
    markAllAsRead,
    isMarkingAsRead,
  };
}
