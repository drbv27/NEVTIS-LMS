// src/app/courses/layout.tsx
"use client";

import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function CoursesHybridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isMainSidebarOpen, toggleMainSidebar } =
    useAuthStore();

  // While determining auth status, display a loader
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If the user IS authenticated, render the full app layout with the Sidebar
  if (user) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile overlay for the sidebar */}
        {isMainSidebarOpen && (
          <div
            onClick={toggleMainSidebar}
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            aria-hidden="true"
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

  // If the user IS NOT authenticated, render the public-facing layout
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
