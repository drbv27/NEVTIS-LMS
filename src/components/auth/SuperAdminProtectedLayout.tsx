// src/components/auth/SuperAdminProtectedLayout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SuperAdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    // Si la autenticación y la carga del perfil han terminado...
    if (!isAuthLoading && !isProfileLoading) {
      // Si no hay usuario/perfil, o si el rol NO es 'admin', redirigimos.
      if (!user || !profile || profile.role !== "admin") {
        toast.error("Acceso denegado. Se requieren permisos de administrador.");
        router.push("/dashboard");
      }
    }
  }, [user, profile, isAuthLoading, isProfileLoading, router]);

  // Mostramos un loader mientras se realizan las comprobaciones.
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando permisos de administrador...</p>
      </div>
    );
  }

  // Si todas las comprobaciones son exitosas, mostramos el contenido.
  if (user && profile && profile.role === "admin") {
    return <>{children}</>;
  }

  // Un fallback por si la redirección tarda en ejecutarse.
  return null;
}
