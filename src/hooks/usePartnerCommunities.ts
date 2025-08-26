// src/hooks/usePartnerCommunities.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Community } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

// La función que obtiene los datos de las comunidades de un partner específico
async function fetchPartnerCommunities(userId: string): Promise<Community[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("creator_id", userId) // La clave: filtramos por el ID del creador
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching partner communities:", error);
    throw new Error("Could not fetch the communities list.");
  }

  return data as Community[];
}

// El hook que usaremos en la tabla de gestión del partner
export function usePartnerCommunities() {
  const { user } = useAuthStore();

  return useQuery<Community[], Error>({
    // La queryKey incluye el user.id para que sea única para cada partner
    queryKey: ["partner-communities", user?.id],
    queryFn: () => fetchPartnerCommunities(user!.id),
    // El hook solo se activará si hay un usuario logueado
    enabled: !!user,
  });
}
