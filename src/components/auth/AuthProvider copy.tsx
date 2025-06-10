"use client";

import { useEffect } from "react";
// Importamos la función en lugar de la constante
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Creamos la instancia del cliente aquí, dentro del componente
  const supabase = createSupabaseBrowserClient();
  const { setUserSession, setLoading } = useAuthStore.getState();

  useEffect(() => {
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserSession(session?.user ?? null, session);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setLoading, setUserSession, supabase.auth]); // Añadimos supabase.auth a las dependencias

  return <>{children}</>;
}
