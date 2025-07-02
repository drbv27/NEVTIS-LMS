// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore, type Membership } from "@/store/authStore";
import { Session } from "@supabase/supabase-js";

// 1. CREAMOS UNA FUNCIÓN ASÍNCRONA SEPARADA PARA OBTENER LAS MEMBRESÍAS
// Esto aísla la lógica asíncrona del listener principal.
async function fetchUserMemberships(userId: string): Promise<Membership[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("community_memberships")
    .select(
      `
      community_id,
      communities (
        name,
        slug,
        image_url
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching user memberships:", error);
    return []; // En caso de error, devolvemos un array vacío.
  }

  // Transformamos los datos para que coincidan con nuestro tipo Membership.
  const transformedMemberships = data.map((m) => ({
    ...m,
    communities: Array.isArray(m.communities)
      ? m.communities[0]
      : m.communities,
  }));

  return transformedMemberships as Membership[];
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseBrowserClient();
  const { setUserSession, setLoading, setUserMemberships } =
    useAuthStore.getState();

  useEffect(() => {
    setLoading(true);

    // 2. EL LISTENER YA NO ES ASÍNCRONO
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session: Session | null) => {
        // Primero, actualizamos la sesión del usuario de forma síncrona.
        // Esto es rápido y desbloquea el estado de carga principal.
        setUserSession(session?.user ?? null, session);

        // Luego, disparamos la lógica asíncrona.
        if (event === "SIGNED_IN" && session?.user) {
          // Llamamos a nuestra función separada para obtener y establecer las membresías.
          fetchUserMemberships(session.user.id).then((memberships) => {
            setUserMemberships(memberships);
          });
        } else if (event === "SIGNED_OUT") {
          // Si el usuario cierra sesión, limpiamos las membresías.
          setUserMemberships([]);
        }

        // El estado de carga principal se resuelve inmediatamente.
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
