"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Si la carga ha terminado y no hay usuario, redirige a login
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Mientras carga, muestra un loader para evitar parpadeos
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado, renderiza el contenido protegido.
  return <>{children}</>;
}
