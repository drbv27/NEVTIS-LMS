// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore, type Membership } from "@/store/authStore";
import { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// La función de fetching se mantiene igual
async function fetchUserMemberships(userId: string): Promise<Membership[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("community_memberships")
    .select("community_id, communities (name, slug, image_url)")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching user memberships:", error);
    return [];
  }

  const transformedMemberships = data.map((m) => ({
    ...m,
    communities: Array.isArray(m.communities)
      ? m.communities[0]
      : m.communities,
  }));

  return transformedMemberships as Membership[];
}

// Un componente "wrapper" para manejar la lógica de datos
function UserMembershipsManager() {
  const { user, setUserMemberships } = useAuthStore();

  // Usamos useQuery para que los datos de membresías puedan ser cacheados e invalidados
  const { data: memberships } = useQuery({
    queryKey: ["user-memberships", user?.id],
    queryFn: () => fetchUserMemberships(user!.id),
    enabled: !!user, // Solo se ejecuta si hay un usuario
    staleTime: 5 * 60 * 1000, // 5 minutos de caché
  });

  useEffect(() => {
    if (memberships) {
      setUserMemberships(memberships);
    }
  }, [memberships, setUserMemberships]);

  return null; // Este componente no renderiza nada, solo gestiona datos
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseBrowserClient();
  const { setUserSession, setLoading } = useAuthStore.getState();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session: Session | null) => {
        setUserSession(session?.user ?? null, session);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Cuando el usuario inicia sesión, invalidamos para obtener datos frescos
          queryClient.invalidateQueries({
            queryKey: ["user-memberships", session?.user?.id],
          });
        } else if (event === "SIGNED_OUT") {
          // Cuando cierra sesión, limpiamos los datos
          useAuthStore.getState().setUserMemberships([]);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <UserMembershipsManager />
      {children}
    </>
  );
}
