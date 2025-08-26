// src/hooks/useMembershipStatus.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

type MembershipStatus = "active" | "pending" | "none";

async function fetchMembershipStatus(
  communityId: string,
  userId: string
): Promise<MembershipStatus> {
  const supabase = createSupabaseBrowserClient();

  // --- INICIO DE LA CORRECCIÓN ---
  // Cambiamos .single() por .limit(1).maybeSingle()
  // .maybeSingle() es la clave: devuelve null si no encuentra filas, en lugar de un error.
  const { data, error } = await supabase
    .from("community_memberships")
    .select("status")
    .eq("community_id", communityId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  // --- FIN DE LA CORRECCIÓN ---

  if (error) {
    // Si hay un error que no sea por 'cero filas', lo lanzamos.
    throw new Error(error.message);
  }

  // Si data es null (no se encontró membresía), devolvemos "none".
  if (!data) {
    return "none";
  }

  // Si encontramos datos, devolvemos el estado.
  return data.status as MembershipStatus;
}

export function useMembershipStatus(communityId: string) {
  const { user } = useAuthStore();

  return useQuery<MembershipStatus, Error>({
    queryKey: ["membership-status", communityId, user?.id],
    queryFn: () => fetchMembershipStatus(communityId, user!.id),
    enabled: !!user,
  });
}
