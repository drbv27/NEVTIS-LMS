// src/app/(main)/partner/layout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { toast } from "sonner";

export default function PartnerProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // Cuando la carga de autenticación y perfil haya terminado...
    if (!isAuthLoading && !isProfileLoading) {
      // Si no hay usuario o perfil, lo redirigimos al login.
      if (!user || !profile) {
        toast.error("Acceso denegado. Debes iniciar sesión.");
        router.push("/login");
        return; // Detenemos la ejecución para evitar más verificaciones
      }

      // Si el rol del usuario no es 'partner' ni 'admin', lo redirigimos al dashboard.
      // Un 'admin' también puede acceder a las páginas de partner para supervisar.
      if (profile.role !== "partner" && profile.role !== "admin") {
        toast.error("Acceso denegado. Se requieren permisos de Partner.");
        router.push("/dashboard");
      }
    }
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  // Mientras se verifica la sesión y el perfil, mostramos un loader.
  if (isAuthLoading || isProfileLoading) {
    return <FullPageLoader />;
  }

  // Si todas las verificaciones pasan, renderizamos el contenido protegido.
  if (
    user &&
    profile &&
    (profile.role === "partner" || profile.role === "admin")
  ) {
    return <>{children}</>;
  }

  // Un fallback para evitar que el contenido parpadee mientras se redirige.
  return null;
}
