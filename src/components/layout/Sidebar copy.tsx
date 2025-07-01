// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
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
  Users2, // 1. IMPORTAMOS un nuevo ícono para la gestión de usuarios
} from "lucide-react";
import { Button } from "../ui/button";

// 2. ACTUALIZAMOS LA ESTRUCTURA DE LOS ITEMS DE NAVEGACIÓN
const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Mis Cursos", href: "/my-courses", icon: BookMarked },
  { title: "Comunidad", href: "/feed", icon: Users },
  { title: "Explorar", href: "/courses", icon: Compass },
  { title: "Mi Perfil", href: "/profile", icon: UserCircle },
];

// Agrupamos los enlaces de administración para una mejor organización
const adminNavItems = [
  {
    title: "Gestión Cursos",
    href: "/admin/courses",
    icon: ShieldCheck,
    requiredRoles: ["admin", "teacher"],
  },
  {
    title: "Gestión Usuarios",
    href: "/admin/users", // El nuevo enlace
    icon: Users2, // El nuevo ícono
    requiredRoles: ["admin"], // Solo los admins pueden ver esto
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isMainSidebarOpen, toggleMainSidebar } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();

  // 3. FILTRAMOS AMBAS LISTAS Y LAS UNIMOS
  const filteredNavItems = sidebarNavItems.filter((item) => {
    // La lógica para items públicos no cambia
    return true;
  });

  const filteredAdminNavItems = adminNavItems.filter((item) => {
    if (isProfileLoading || !profile) {
      return false;
    }
    return item.requiredRoles.includes(profile.role);
  });

  const allNavItems = [...filteredNavItems, ...filteredAdminNavItems];

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

        {/* 4. RENDERIZAMOS LA LISTA COMPLETA DE ITEMS */}
        <nav className={`flex-1 px-4 space-y-2`}>
          {allNavItems.map((item) => (
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
