// src/app/(main)/admin/courses/page.tsx
"use client";

import { useProfile } from "@/hooks/useProfile";
import CoursesTable from "@/components/admin/CoursesTable";
import { Skeleton } from "@/components/ui/skeleton";
import PartnerCoursesTable from "@/components/partner/PartnerCoursesTable"; // <-- Importamos la nueva tabla

export default function AdminCoursesPageManager() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Si el rol es partner, mostramos su tabla específica.
  if (profile?.role === "partner") {
    return <PartnerCoursesTable />; // <-- La usamos aquí
  }

  // Para 'admin' y 'teacher', mostramos la tabla de administración original.
  return <CoursesTable />;
}
