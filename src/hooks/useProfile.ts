// src/hooks/useProfile.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Profile } from "@/lib/types";
import { toast } from "sonner";

export function useProfile() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // 1. QUERY: Para obtener los datos del perfil
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", user?.id], // La clave de la query depende del ID del usuario
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile in useQuery:", error);
        throw new Error(error.message);
      }
      return data as Profile;
    },
    enabled: !!user, // La query solo se ejecutará si existe un usuario
    staleTime: 1000 * 60 * 5, // 5 minutos de caché antes de considerarse "stale" (obsoleto)
  });

  // 2. MUTATION: Para actualizar los datos del perfil
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
      // Invalida la query del perfil para que se vuelva a solicitar automáticamente
      // y la UI se actualice con los nuevos datos. ¡Esta es la magia!
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  return { profile, isLoading, error, updateProfile, isUpdating };
}
