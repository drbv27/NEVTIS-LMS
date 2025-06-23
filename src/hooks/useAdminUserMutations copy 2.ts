// src/hooks/useAdminUserMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Profile } from "@/lib/types";
import { toast } from "sonner";

// 1. DEFINIMOS EL PAYLOAD PARA LA CREACIÓN DE USUARIO
// Debe coincidir con la interfaz 'UserData' de nuestra Edge Function
interface CreateUserPayload {
  email: string;
  password?: string;
  full_name: string;
  role: Profile["role"];
}

interface UpdateUserPayload {
  userId: string;
  role: Profile["role"];
  full_name: string;
  bio: string | null;
}

// La función de actualización no cambia
async function updateUserProfile({
  userId,
  role,
  full_name,
  bio,
}: UpdateUserPayload) {
  const supabase = createSupabaseBrowserClient();
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

// 2. AÑADIMOS LA FUNCIÓN PARA LLAMAR A LA EDGE FUNCTION
async function createNewUser(payload: CreateUserPayload) {
  const supabase = createSupabaseBrowserClient();

  // 'invoke' es la forma de llamar a una Edge Function desde el cliente
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: payload, // Le pasamos los datos del nuevo usuario en el cuerpo
  });

  if (error) {
    // Si la función devuelve un error (ej. permisos), lo lanzamos
    throw new Error(error.message);
  }

  // Si la función personalizada devuelve un error en su JSON, también lo lanzamos
  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending: isUpdatingUser } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success("¡Perfil de usuario actualizado con éxito!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 3. CREAMOS LA NUEVA MUTACIÓN PARA 'createUser'
  const { mutate: createUser, isPending: isCreatingUser } = useMutation({
    mutationFn: createNewUser,
    onSuccess: (data) => {
      toast.success(data.message || "¡Usuario creado con éxito!");
      // Invalidamos la caché para que la tabla de usuarios se actualice
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 4. EXPORTAMOS LAS NUEVAS FUNCIONES
  return {
    updateUser,
    isUpdatingUser,
    createUser,
    isCreatingUser,
  };
}
