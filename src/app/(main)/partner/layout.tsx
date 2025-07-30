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
    // Una vez que la autenticación y la carga del perfil se completan...
    if (!isAuthLoading && !isProfileLoading) {
      // Si no hay usuario o perfil, redirigir al login.
      if (!user || !profile) {
        toast.error("Acceso denegado. Debes iniciar sesión.");
        router.push("/login");
      }
      // Si el rol del usuario no es 'partner' ni 'admin', redirigir al dashboard principal.
      // Un admin también puede acceder a las páginas de partner para depuración o asistencia.
      else if (profile.role !== "partner" && profile.role !== "admin") {
        toast.error("Acceso denegado. Se requieren permisos de partner.");
        router.push("/dashboard");
      }
    }
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  // Mostrar un loader mientras se verifica la sesión y el perfil.
  if (isAuthLoading || isProfileLoading) {
    return <FullPageLoader />;
  }

  // Si todas las verificaciones pasan, renderizar el contenido protegido para partners.
  if (
    user &&
    profile &&
    (profile.role === "partner" || profile.role === "admin")
  ) {
    return <>{children}</>;
  }

  // Fallback para evitar que el contenido parpadee mientras se redirige.
  return null;
}
