// src/hooks/usePendingApprovals.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useProfile } from "./useProfile"; // 1. Importamos el hook de perfil

export interface PendingApproval {
  id: number;
  user_id: string;
  community_id: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  communities: { name: string | null } | null;
}

async function fetchPendingApprovals(): Promise<{
  approvals: PendingApproval[];
  count: number;
}> {
  const supabase = createSupabaseBrowserClient();
  const { data, error, count } = await supabase
    .from("community_memberships")
    .select(
      `id, user_id, community_id, created_at, profiles(full_name), communities(name)`,
      { count: "exact" }
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending approvals:", error);
    throw new Error("Could not fetch pending approvals.");
  }

  const transformedData = data.map((item) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
    communities: Array.isArray(item.communities)
      ? item.communities[0]
      : item.communities,
  }));

  return { approvals: transformedData as PendingApproval[], count: count ?? 0 };
}

export function usePendingApprovals() {
  const { profile } = useProfile(); // 2. Obtenemos el perfil del usuario

  return useQuery<{ approvals: PendingApproval[]; count: number }, Error>({
    queryKey: ["pending-approvals", profile?.id], // La query key ahora depende del usuario
    queryFn: fetchPendingApprovals,
    // 3. La query solo se ejecutará si el perfil existe y su rol es 'admin'
    enabled: !!profile && profile.role === "admin",
    // 4. Refrescamos los datos periódicamente (cada 2 minutos)
    refetchInterval: 120000,
  });
}
