// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile"; // <-- 1. IMPORTAMOS useProfile
import {
  Home,
  BookMarked,
  Users,
  Compass,
  UserCircle,
  ChevronLeft,
  X,
  Component,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { Button } from "../ui/button";

const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Mis Cursos", href: "/my-courses", icon: BookMarked },
  { title: "Comunidad", href: "/feed", icon: Users },
  { title: "Explorar", href: "/courses", icon: Compass },
  { title: "Mi Perfil", href: "/profile", icon: UserCircle },
  // 2. AÑADIMOS UNA PROPIEDAD PARA ESPECIFICAR LOS ROLES REQUERIDOS
  {
    title: "Admin",
    href: "/admin/courses",
    icon: ShieldCheck,
    requiredRoles: ["admin", "teacher"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isMainSidebarOpen, toggleMainSidebar } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile(); // <-- 3. USAMOS EL HOOK PARA OBTENER EL PERFIL

  // 4. FILTRAMOS LOS ENLACES ANTES DE RENDERIZARLOS
  const filteredNavItems = sidebarNavItems.filter((item) => {
    // Si el ítem no requiere roles específicos, siempre se muestra
    if (!item.requiredRoles) {
      return true;
    }
    // Si el ítem requiere roles, pero el perfil aún está cargando o no existe, no lo mostramos
    if (isProfileLoading || !profile) {
      return false;
    }
    // Si el perfil existe, mostramos el ítem solo si el rol del usuario está en la lista de roles requeridos
    return item.requiredRoles.includes(profile.role);
  });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 h-full flex-col border-r bg-card flex transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0 ${
        isMainSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full sm:w-20"
      }`}
    >
      <div
        className={`flex flex-col gap-y-7 overflow-y-auto ${
          isMainSidebarOpen ? "w-64" : "sm:w-20"
        }`}
      >
        <div
          className={`h-16 shrink-0 flex items-center ${
            isMainSidebarOpen ? "px-6" : "justify-center"
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <Component className="h-7 w-7 text-primary" />
            <h1
              className={`text-xl font-bold text-primary transition-all duration-200 ${
                !isMainSidebarOpen && "opacity-0 scale-0 w-0"
              }`}
            >
              MiLMS
            </h1>
          </Link>
          <Button
            onClick={toggleMainSidebar}
            variant="ghost"
            size="icon"
            className="ml-auto sm:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* 5. USAMOS LA NUEVA LISTA FILTRADA PARA EL MAP */}
        <nav className={`flex-1 px-4 space-y-2`}>
          {filteredNavItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-x-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              } ${!isMainSidebarOpen && "justify-center"}`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={`${!isMainSidebarOpen && "hidden"}`}>
                {item.title}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-4 mt-auto border-t shrink-0 hidden sm:block">
          <Button
            onClick={toggleMainSidebar}
            variant="outline"
            size="icon"
            className="w-full"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-300 ${
                !isMainSidebarOpen && "rotate-180"
              }`}
            />
          </Button>
        </div>
      </div>
    </aside>
  );
}
