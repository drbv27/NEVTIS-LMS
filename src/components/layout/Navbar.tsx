"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react"; // Importamos el icono de Menu

export function Navbar() {
  const { user, isLoading, toggleMobileSidebar } = useAuthStore(); // Obtenemos la acción
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Botón Hamburguesa para móvil */}
            <button
              onClick={toggleMobileSidebar}
              className="mr-2 p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 sm:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo o link principal. Si hay usuario, no se muestra en móvil para dar espacio. */}
            <Link
              href="/"
              className={`text-xl font-bold text-gray-900 ${
                user ? "hidden sm:block" : "block"
              }`}
            >
              MiLMS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            ) : user ? (
              <>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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
