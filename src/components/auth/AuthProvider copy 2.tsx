// src/components/auth/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore, type Membership } from "@/store/authStore";
import { Session } from "@supabase/supabase-js";

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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        setUserSession(session?.user ?? null, session);

        if (event === "SIGNED_IN" && session?.user) {
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
            .eq("user_id", session.user.id)
            .eq("status", "active");

          if (error) {
            console.error("Error fetching user memberships:", error);
            setUserMemberships([]);
          } else {
            // --- INICIO DE LA CORRECCIÓN ---
            // Transformamos los datos para que coincidan con nuestro tipo Membership.
            // Aplanamos la propiedad 'communities' de un array a un solo objeto.
            const transformedMemberships = data.map((m) => ({
              ...m,
              communities: Array.isArray(m.communities)
                ? m.communities[0]
                : m.communities,
            }));
            // --- FIN DE LA CORRECCIÓN ---

            setUserMemberships(transformedMemberships as Membership[]);
          }
        } else if (event === "SIGNED_OUT") {
          setUserMemberships([]);
        }

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
