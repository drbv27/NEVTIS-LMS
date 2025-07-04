// src/components/dashboard/DashboardManager.tsx
"use client";

import { useProfile } from "@/hooks/useProfile";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import { Skeleton } from "../ui/skeleton";

export default function DashboardManager() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2 mt-2" />
      </div>
    );
  }

  switch (profile?.role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <p>Rol de usuario no reconocido. Contacta a soporte.</p>;
  }
}
