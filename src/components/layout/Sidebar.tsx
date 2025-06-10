"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookMarked,
  Users,
  Compass,
  UserCircle,
  XIcon,
  PlusCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // <--- CAMBIO CLAVE: Usamos Zustand
import { Button } from "@/components/ui/button"; // Asumimos que tienes un componente de botón, sino usa <button>

// Definimos los enlaces de la sidebar
const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Mis Cursos", href: "/my-courses", icon: BookMarked },
  { title: "Comunidad", href: "/feed", icon: Users },
  { title: "Explorar", href: "/courses", icon: Compass },
  { title: "Mi Perfil", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  // CAMBIO CLAVE: Obtenemos el estado y la acción de nuestro store de Zustand
  const { isMobileSidebarOpen, toggleMobileSidebar } = useAuthStore();

  const handleLinkClick = () => {
    // Cierra la sidebar al hacer clic en un enlace en móvil
    if (isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  return (
    <>
      {/* Overlay para cerrar la sidebar en móvil al hacer clic fuera */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r transition-transform duration-300 ease-in-out sm:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          {/* Botón para cerrar en móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 sm:hidden"
            onClick={toggleMobileSidebar}
            aria-label="Cerrar menú"
          >
            <XIcon className="h-6 w-6" />
          </Button>

          <div className="text-2xl font-bold text-indigo-600 mb-10 pl-3">
            MiLMS
          </div>

          <nav className="space-y-2">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
