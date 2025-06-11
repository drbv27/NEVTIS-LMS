"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Home,
  BookMarked,
  Users,
  Compass,
  UserCircle,
  ChevronLeft,
  X,
  Component,
} from "lucide-react"; // Importamos un icono para el logo
import { Button } from "../ui/button";

const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Mis Cursos", href: "/my-courses", icon: BookMarked },
  { title: "Comunidad", href: "/feed", icon: Users },
  { title: "Explorar", href: "/courses", icon: Compass },
  { title: "Mi Perfil", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isMainSidebarOpen, toggleMainSidebar } = useAuthStore();

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
        {/* --- INICIO DE CORRECCIONES (LOGO Y BORDES) --- */}
        {/* 1. Quitamos la clase 'border-b' para eliminar la cuadrícula */}
        <div
          className={`h-16 shrink-0 flex items-center ${
            isMainSidebarOpen ? "px-6" : "justify-center"
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            {/* 2. Mostramos un icono cuando la barra está colapsada */}
            <Component className="h-7 w-7 text-primary" />
            <h1
              className={`text-xl font-bold text-primary transition-all duration-200 ${
                !isMainSidebarOpen && "opacity-0 scale-0 w-0"
              }`}
            >
              MiLMS
            </h1>
          </Link>
          {/* Botón de cierre para móvil */}
          <Button
            onClick={toggleMainSidebar}
            variant="ghost"
            size="icon"
            className="ml-auto sm:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        {/* --- FIN DE CORRECCIONES --- */}

        <nav className={`flex-1 px-4 space-y-2`}>
          {sidebarNavItems.map((item) => (
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
        {/* El botón de colapso ahora solo se muestra en desktop */}
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
