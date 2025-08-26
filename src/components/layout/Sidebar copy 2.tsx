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
  ChevronsUpDown,
  X,
  Component,
  ShieldCheck,
  Users2,
  LayoutGrid,
  Library,
  Briefcase, // Nuevo ícono para Partner
  Settings, // Nuevo ícono para Partner
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Navegación para Estudiantes
const sidebarNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "My Courses", href: "/my-courses", icon: BookMarked },
  { title: "Community", href: "/feed", icon: Users },
  { title: "Explore", href: "/courses", icon: Compass },
  { title: "My Profile", href: "/profile", icon: UserCircle },
];

// NUEVA sección de navegación para Partners
const partnerNavItems = [
  {
    title: "My Communities",
    href: "/partner/communities",
    icon: Briefcase,
    requiredRoles: ["partner", "admin"], // También visible para el admin
  },
  {
    title: "Stripe Settings",
    href: "/partner/stripe-settings",
    icon: Settings,
    requiredRoles: ["partner", "admin"], // También visible para el admin
  },
];

// Navegación para Admin/Teacher
const adminNavItems = [
  {
    title: "Category Management",
    href: "/admin/categories",
    icon: LayoutGrid,
    requiredRoles: ["admin", "teacher"],
  },
  {
    title: "Community Management",
    href: "/admin/communities",
    icon: Library,
    requiredRoles: ["admin"],
  },
  {
    title: "Course Management",
    href: "/admin/courses",
    icon: ShieldCheck,
    requiredRoles: ["admin", "teacher"],
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users2,
    requiredRoles: ["admin"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    isMainSidebarOpen,
    toggleMainSidebar,
    userMemberships,
    activeCommunityId,
    setActiveCommunityId,
  } = useAuthStore();
  const { profile, isLoading: isProfileLoading } = useProfile();

  const activeCommunity = userMemberships.find(
    (m) => m.community_id === activeCommunityId
  )?.communities;

  // Filtramos la navegación según el rol del perfil
  const filteredNavItems = sidebarNavItems.filter(() => true);

  const filteredPartnerNavItems = partnerNavItems.filter((item) => {
    if (isProfileLoading || !profile) return false;
    return item.requiredRoles.includes(profile.role);
  });

  const filteredAdminNavItems = adminNavItems.filter((item) => {
    if (isProfileLoading || !profile) return false;
    // Un partner NO debe ver los links de admin, a menos que ya estén en partnerNavItems
    if (profile.role === "partner") return false;
    return item.requiredRoles.includes(profile.role);
  });

  // Combinamos todas las listas de navegación filtradas
  const allNavItems = [
    ...filteredNavItems,
    ...filteredPartnerNavItems,
    ...filteredAdminNavItems,
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 h-full flex-col border-r bg-card flex transition-transform duration-300 ease-in-out sm:relative sm:translate-x-0 ${
        isMainSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full sm:w-20"
      }`}
    >
      {/* El resto del componente JSX no necesita cambios, solo la lógica de filtrado de arriba */}
      <div
        className={`flex flex-col gap-y-4 overflow-y-auto ${
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
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

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
                    {activeCommunity?.name || "Select..."}
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
              <DropdownMenuLabel>Your Communities</DropdownMenuLabel>
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
            aria-label={
              isMainSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
            }
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
