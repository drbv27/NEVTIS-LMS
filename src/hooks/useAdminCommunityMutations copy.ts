// src/hooks/useAdminCommunityMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// La interfaz no cambia
interface CreateCommunityPayload {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  stripe_price_id: string | null;
}

// --- INICIO DE LA CORRECCIÓN: Renombramos la función para evitar colisión ---
async function createCommunityFn(
  payload: CreateCommunityPayload
): Promise<void> {
  // --- FIN DE LA CORRECCIÓN ---
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

export function useAdminCommunityMutations() {
  const queryClient = useQueryClient();

  const { mutate: createCommunity, isPending: isCreatingCommunity } =
    useMutation({
      // --- INICIO DE LA CORRECCIÓN: Usamos el nuevo nombre de la función ---
      mutationFn: createCommunityFn,
      // --- FIN DE LA CORRECCIÓN ---
      onSuccess: () => {
        toast.success("¡Comunidad creada con éxito!");
        queryClient.invalidateQueries({ queryKey: ["admin-communities"] });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return {
    createCommunity,
    isCreatingCommunity,
  };
}
