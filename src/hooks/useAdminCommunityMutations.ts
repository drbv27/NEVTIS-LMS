// src/hooks/useAdminCommunityMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type Community } from "@/lib/types";

// Interfaces para crear y actualizar (sin cambios)
interface CreateCommunityPayload {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  stripe_price_id: string | null;
}

interface UpdateCommunityPayload extends Partial<CreateCommunityPayload> {
  id: string;
}

// 1. AÑADIMOS LA INTERFAZ PARA ELIMINAR
interface DeleteCommunityPayload {
  id: string;
}

// La función para crear no cambia
async function createCommunityFn(
  payload: CreateCommunityPayload
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("communities").insert(payload);

  if (error) {
    if (
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      if (error.message.includes("communities_slug_key")) {
        throw new Error("El 'slug' ya está en uso. Por favor, elige otro.");
      }
    }
    console.error("Error creating community:", error);
    throw new Error("No se pudo crear la comunidad.");
  }
}

// La función para actualizar no cambia
async function updateCommunityFn(
  payload: UpdateCommunityPayload
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { id, ...updateData } = payload;

  const { error } = await supabase
    .from("communities")
    .update(updateData)
    .eq("id", id);

  if (error) {
    if (
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      if (error.message.includes("communities_slug_key")) {
        throw new Error("El 'slug' ya está en uso. Por favor, elige otro.");
      }
    }
    console.error("Error updating community:", error);
    throw new Error("No se pudo actualizar la comunidad.");
  }
}

// 2. AÑADIMOS LA FUNCIÓN PARA ELIMINAR LA COMUNIDAD
async function deleteCommunityFn({
  id,
}: DeleteCommunityPayload): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("communities").delete().eq("id", id);

  if (error) {
    console.error("Error deleting community:", error);
    throw new Error("No se pudo eliminar la comunidad.");
  }
}

export function useAdminCommunityMutations() {
  const queryClient = useQueryClient();

  const { mutate: createCommunity, isPending: isCreatingCommunity } =
    useMutation({
      mutationFn: createCommunityFn,
      onSuccess: () => {
        toast.success("¡Comunidad creada con éxito!");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateCommunity, isPending: isUpdatingCommunity } =
    useMutation({
      mutationFn: updateCommunityFn,
      onSuccess: () => {
        toast.success("¡Comunidad actualizada con éxito!");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // 3. AÑADIMOS LA NUEVA MUTACIÓN PARA ELIMINAR
  const { mutate: deleteCommunity, isPending: isDeletingCommunity } =
    useMutation({
      mutationFn: deleteCommunityFn,
      onSuccess: () => {
        toast.success("Comunidad eliminada con éxito.");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // 4. EXPORTAMOS LAS NUEVAS FUNCIONES
  return {
    createCommunity,
    isCreatingCommunity,
    updateCommunity,
    isUpdatingCommunity,
    deleteCommunity,
    isDeletingCommunity,
  };
}
