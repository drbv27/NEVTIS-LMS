"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando la sesión ni el perfil...
    if (!isAuthLoading && !isProfileLoading) {
      // Y no hay usuario o no hay perfil, lo mandamos a login.
      if (!user || !profile) {
        router.push("/login");
      }
      // Si hay perfil, pero el rol no es el adecuado, lo mandamos al dashboard principal.
      else if (profile.role !== "admin" && profile.role !== "teacher") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  // Muestra un loader mientras se verifica la sesión y el perfil.
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando acceso...</p>
      </div>
    );
  }

  // Si pasa todas las verificaciones, muestra el contenido de la página de admin.
  if (
    user &&
    profile &&
    (profile.role === "admin" || profile.role === "teacher")
  ) {
    return <>{children}</>;
  }

  // Fallback por si la redirección tarda.
  return null;
}
