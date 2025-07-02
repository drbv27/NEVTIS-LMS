// src/hooks/usePublicCommunities.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Community } from "@/lib/types";

// La función que obtiene la lista de todas las comunidades
async function fetchPublicCommunities(): Promise<Community[]> {
  const supabase = createSupabaseBrowserClient();

  // Seleccionamos todas las comunidades y las ordenamos por nombre
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching public communities:", error);
    throw new Error("No se pudo obtener la lista de comunidades.");
  }

  return data as Community[];
}

// El hook que usaremos en nuestro nuevo catálogo
export function usePublicCommunities() {
  return useQuery<Community[], Error>({
    queryKey: ["public-communities"], // Clave única para la caché
    queryFn: fetchPublicCommunities,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
}
