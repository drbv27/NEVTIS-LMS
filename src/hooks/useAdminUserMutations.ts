// src/hooks/useAdminUserMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Profile } from "@/lib/types";
import { toast } from "sonner";

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

// 1. AÑADIMOS EL PAYLOAD PARA LA ELIMINACIÓN
interface DeleteUserPayload {
  userIdToDelete: string;
}

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

async function createNewUser(payload: CreateUserPayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: payload,
  });

  if (error) throw new Error(error.message);
  if (data.error) throw new Error(data.error);
  return data;
}

// 2. AÑADIMOS LA FUNCIÓN PARA LLAMAR A LA EDGE FUNCTION 'delete-user'
async function deleteUserAccount({ userIdToDelete }: DeleteUserPayload) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke("delete-user", {
    body: { userIdToDelete },
  });

  if (error) throw new Error(error.message);
  if (data.error) throw new Error(data.error);
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

  const { mutate: createUser, isPending: isCreatingUser } = useMutation({
    mutationFn: createNewUser,
    onSuccess: (data) => {
      toast.success(data.message || "¡Usuario creado con éxito!");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 3. CREAMOS LA NUEVA MUTACIÓN PARA 'deleteUser'
  const { mutate: deleteUser, isPending: isDeletingUser } = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: (data) => {
      toast.success(data.message || "Usuario eliminado con éxito.");
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
    deleteUser,
    isDeletingUser,
  };
}
