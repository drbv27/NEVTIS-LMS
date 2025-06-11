// app/(main)/layout.tsx
"use client";

import ProtectedLayout from "@/components/auth/ProtectedLayout";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMainSidebarOpen, toggleMainSidebar } = useAuthStore();

  return (
    <ProtectedLayout>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Overlay que solo aparece en móvil cuando la sidebar está abierta */}
        {isMainSidebarOpen && (
          <div
            onClick={toggleMainSidebar}
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          />
        )}

        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          {/* Hacemos que SOLO esta área de main tenga scroll */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
