// src/hooks/useAdminUsers.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Profile } from "@/lib/types";

// La función que obtiene los datos de todos los perfiles/usuarios
async function fetchAllUsers(): Promise<Profile[]> {
  const supabase = createSupabaseBrowserClient();

  // Seleccionamos todos los perfiles y los ordenamos por fecha de creación
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("No se pudo obtener la lista de usuarios.");
  }

  return data as Profile[];
}

// El hook personalizado que envuelve la lógica
export function useAdminUsers() {
  return useQuery<Profile[], Error>({
    queryKey: ["admin-users"], // Clave única para la caché de esta query
    queryFn: fetchAllUsers,
    staleTime: 1000 * 60 * 5, // Consideramos que la lista no cambia tan a menudo (5 min)
  });
}
