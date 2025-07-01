// src/hooks/useAdminCommunities.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Community } from "@/lib/types";

// La función que obtiene los datos de todas las comunidades
async function fetchAllCommunities(): Promise<Community[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching communities:", error);
    throw new Error("No se pudo obtener la lista de comunidades.");
  }

  return data as Community[];
}

// El hook que usaremos en nuestra tabla de administración
export function useAdminCommunities() {
  return useQuery<Community[], Error>({
    queryKey: ["admin-communities"], // Clave única para la caché de esta query
    queryFn: fetchAllCommunities,
  });
}
