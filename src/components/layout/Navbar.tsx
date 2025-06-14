//src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar() {
  const { user, isLoading, toggleMainSidebar } = useAuthStore();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-background sticky top-0 z-20 border-b border-border h-16 flex items-center">
      <nav className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* --- INICIO DE LA CORRECCIÓN --- */}
          {/* GRUPO IZQUIERDO: Contiene el botón de menú móvil y el logo en desktop */}
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleMainSidebar}
              variant="ghost"
              size="icon"
              className="sm:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            {/* El logo que se muestra en la barra principal ahora es innecesario aquí, 
                ya que lo tenemos en la Sidebar. Esto limpia la Navbar. */}
          </div>

          {/* GRUPO DERECHO: Contiene el menú de usuario */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
            ) : user ? (
              <>
                <span className="hidden sm:block text-sm font-medium text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link href="/login" passHref>
                <Button>Iniciar Sesión</Button>
              </Link>
            )}
          </div>
          {/* --- FIN DE LA CORRECCIÓN --- */}
        </div>
      </nav>
    </header>
  );
}
