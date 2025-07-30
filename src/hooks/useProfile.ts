// src/hooks/useProfile.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type Profile } from "@/lib/types";
import { toast } from "sonner";

export function useProfile() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // QUERY: Para obtener los datos del perfil (sin cambios)
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(`*`)
        .eq("id", user.id)
        .single();
      if (error) {
        console.error("Error fetching profile:", error);
        throw new Error(error.message);
      }
      return data as Profile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // MUTATION: Para actualizar los datos del perfil (sin cambios)
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", user.id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Perfil actualizado con éxito");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  // --- INICIO DEL NUEVO CÓDIGO ---
  // MUTATION: Para seguir o dejar de seguir a un usuario
  const { mutate: toggleFollow, isPending: isFollowing } = useMutation({
    mutationFn: async (profileId: string) => {
      if (!user)
        throw new Error("Debes iniciar sesión para seguir a otros usuarios.");

      const { error } = await supabase.rpc("toggle_follow", {
        following_id_param: profileId,
      });

      if (error) {
        console.error("Error toggling follow:", error);
        throw new Error("No se pudo procesar la acción.");
      }
    },
    onSuccess: () => {
      // Refrescamos todas las queries de posts y perfiles para actualizar los contadores
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  // --- FIN DEL NUEVO CÓDIGO ---

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating,
    toggleFollow,
    isFollowing, // Exportamos la nueva mutación
  };
}
