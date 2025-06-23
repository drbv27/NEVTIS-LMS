// src/hooks/useAdminUserMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Profile } from "@/lib/types";
import { toast } from "sonner";

// 1. AMPLIAMOS EL PAYLOAD para incluir los nuevos campos
interface UpdateUserPayload {
  userId: string;
  role: Profile["role"];
  full_name: string;
  bio: string | null;
}

// 2. RENOMBRAMOS LA FUNCIÓN para que sea más genérica
async function updateUserProfile({
  userId,
  role,
  full_name,
  bio,
}: UpdateUserPayload) {
  const supabase = createSupabaseBrowserClient();
  // 3. ACTUALIZAMOS todos los nuevos campos en la llamada
  const { error } = await supabase
    .from("profiles")
    .update({
      role: role,
      full_name: full_name,
      bio: bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    throw new Error("No se pudo actualizar el perfil del usuario.");
  }
}

// El hook no cambia su nombre, pero ahora su función 'updateUser' es más potente
export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdatingUser } = useMutation({
    mutationFn: updateUserProfile, // Llama a la nueva función
    onSuccess: () => {
      toast.success("¡Perfil de usuario actualizado con éxito!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    updateUser,
    isUpdatingUser,
  };
}
