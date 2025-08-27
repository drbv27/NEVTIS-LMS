// src/hooks/usePendingApprovals.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Definimos la forma que tendrán los datos que recibimos
export interface PendingApproval {
  id: number; // ID de la fila en community_memberships
  user_id: string;
  community_id: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  communities: {
    name: string | null;
  } | null;
}

// La función que obtiene los datos
async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("community_memberships")
    .select(
      `
      id,
      user_id,
      community_id,
      created_at,
      profiles ( full_name ),
      communities ( name )
    `
    )
    .eq("status", "pending") // La clave: filtramos solo por el estado 'pending'
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending approvals:", error);
    throw new Error("Could not fetch pending approvals.");
  }

  // Transformamos los datos para aplanar los objetos anidados, como hemos hecho antes
  const transformedData = data.map((item) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
    communities: Array.isArray(item.communities)
      ? item.communities[0]
      : item.communities,
  }));

  return transformedData as PendingApproval[];
}

// El hook que usaremos en nuestra tabla de administración
export function usePendingApprovals() {
  const { user } = useAuthStore();

  return useQuery<PendingApproval[], Error>({
    queryKey: ["pending-approvals"],
    queryFn: fetchPendingApprovals,
    // La query solo se ejecuta si el usuario está logueado (y asumimos que es un admin)
    enabled: !!user,
  });
}
