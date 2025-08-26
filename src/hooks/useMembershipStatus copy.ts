// src/hooks/useMembershipStatus.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Definimos los posibles estados que puede tener una membresía
type MembershipStatus = "active" | "pending" | "none";

// La función que obtiene los datos
async function fetchMembershipStatus(
  communityId: string,
  userId: string
): Promise<MembershipStatus> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .single();

  if (error) {
    // Si el error indica que no se encontró ninguna fila, significa que no hay membresía.
    if (error.code === "PGRST116") {
      return "none";
    }
    // Para cualquier otro error, lo lanzamos.
    throw new Error(error.message);
  }

  // Si encontramos datos, devolvemos el estado.
  return data.status as MembershipStatus;
}

// El hook que usaremos en nuestros componentes
export function useMembershipStatus(communityId: string) {
  const { user } = useAuthStore();

  return useQuery<MembershipStatus, Error>({
    // La clave de la query incluye el ID de la comunidad y del usuario para ser única
    queryKey: ["membership-status", communityId, user?.id],
    queryFn: () => fetchMembershipStatus(communityId, user!.id),
    // La query solo se ejecutará si hay un usuario logueado
    enabled: !!user,
  });
}
