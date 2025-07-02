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
  ChevronsUpDown, // 1. IMPORTAMOS un nuevo ícono
  X,
  Component,
  ShieldCheck,
  Users2,
  Library,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // 2. IMPORTAMOS Avatar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"; // 3. IMPORTAMOS DropdownMenu

// Las listas de navegación no cambian
const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Mis Cursos", href: "/my-courses", icon: BookMarked },
  { title: "Comunidad", href: "/feed", icon: Users },
  { title: "Explorar", href: "/courses", icon: Compass },
  { title: "Mi Perfil", href: "/profile", icon: UserCircle },
];

const adminNavItems = [
  {
    title: "Gestión Comunidades",
    href: "/admin/communities",
    icon: Library,
    requiredRoles: ["admin"],
  },
  {
    title: "Gestión Cursos",
    href: "/admin/courses",
    icon: ShieldCheck,
    requiredRoles: ["admin", "teacher"],
  },
  {
    title: "Gestión Usuarios",
    href: "/admin/users",
    icon: Users2,
    requiredRoles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  // 4. OBTENEMOS LOS NUEVOS ESTADOS Y ACCIONES DEL STORE
  const {
    isMainSidebarOpen,
    toggleMainSidebar,
    userMemberships,
    activeCommunityId,
    setActiveCommunityId,
  } = useAuthStore();

  const { profile, isLoading: isProfileLoading } = useProfile();

  // Lógica para encontrar la comunidad activa actual
  const activeCommunity = userMemberships.find(
    (m) => m.community_id === activeCommunityId
  )?.communities;

  // Lógica de filtrado de enlaces (sin cambios)
  const filteredNavItems = sidebarNavItems.filter(() => true);
  const filteredAdminNavItems = adminNavItems.filter((item) => {
    if (isProfileLoading || !profile) return false;
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
        className={`flex flex-col gap-y-4 overflow-y-auto ${
          isMainSidebarOpen ? "w-64" : "sm:w-20"
        }`}
      >
        {/* Logo (sin cambios) */}
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

        {/* 5. NUEVO SELECTOR DE COMUNIDAD */}
        <div className={`px-4 ${!isMainSidebarOpen && "px-2"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-between ${
                  !isMainSidebarOpen && "justify-center"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activeCommunity?.image_url || ""} />
                    <AvatarFallback>
                      <Library className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`truncate ${!isMainSidebarOpen && "hidden"}`}
                  >
                    {activeCommunity?.name || "Seleccionar..."}
                  </span>
                </div>
                <ChevronsUpDown
                  className={`h-4 w-4 text-muted-foreground ${
                    !isMainSidebarOpen && "hidden"
                  }`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Tus Comunidades</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userMemberships.map((membership) => (
                <DropdownMenuItem
                  key={membership.community_id}
                  onClick={() => setActiveCommunityId(membership.community_id)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage
                      src={membership.communities?.image_url || ""}
                    />
                    <AvatarFallback>
                      <Library className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{membership.communities?.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navegación principal (sin cambios) */}
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

        {/* Botón de colapsar (sin cambios) */}
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
