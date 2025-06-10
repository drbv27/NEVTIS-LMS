"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";

export default function Navbar() {
  const { user, isLoading, toggleMobileSidebar } = useAuthStore();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    // --- INICIO DE LA CORRECCIÓN ---
    // Cambiamos bg-white por bg-background y shadow-sm por una línea de borde
    <header className="bg-background sticky top-0 z-20 border-b border-border">
      {/* --- FIN DE LA CORRECCIÓN --- */}
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Botón Hamburguesa para móvil */}
            {/* --- INICIO DE LA CORRECCIÓN --- */}
            <button
              onClick={toggleMobileSidebar}
              className="mr-2 p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
              aria-label="Abrir menú"
            >
              {/* --- FIN DE LA CORRECCIÓN --- */}
              <Menu className="h-6 w-6" />
            </button>

            {/* --- INICIO DE LA CORRECCIÓN --- */}
            <Link
              href="/"
              className={`text-xl font-bold text-foreground ${
                user ? "hidden sm:block" : "block"
              }`}
            >
              MiLMS
            </Link>
            {/* --- FIN DE LA CORRECCIÓN --- */}
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
            ) : user ? (
              <>
                {/* --- INICIO DE LA CORRECCIÓN --- */}
                <span className="hidden sm:block text-sm font-medium text-muted-foreground">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
                {/* --- FIN DE LA CORRECCIÓN --- */}
              </>
            ) : (
              // Este ya usa el color primario, por lo que está bien
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
