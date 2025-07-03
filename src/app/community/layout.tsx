// src/app/community/layout.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityHybridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isMainSidebarOpen, toggleMainSidebar } =
    useAuthStore();

  // Mientras se determina el estado de autenticación, mostramos un esqueleto de carga
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 w-full px-8">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
          <div className="mt-8 grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Si el usuario ESTÁ autenticado, renderiza la app completa con Sidebar
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {isMainSidebarOpen && (
          <div
            onClick={toggleMainSidebar}
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          />
        )}
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Si el usuario NO está autenticado, renderiza la vista pública (solo Navbar)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
