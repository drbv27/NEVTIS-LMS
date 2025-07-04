// src/hooks/useTeacherDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Definimos la forma de los datos que devolverá el hook
export interface TeacherDashboardCourse {
  id: string;
  title: string;
  image_url: string | null;
  status: "published" | "draft";
  student_count: number;
}

async function fetchTeacherDashboardData(
  userId: string | undefined
): Promise<TeacherDashboardCourse[]> {
  if (!userId) return [];

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("get_teacher_dashboard_data");

  if (error) {
    console.error("Error fetching teacher dashboard data:", error);
    throw new Error(
      "No se pudieron cargar los datos del dashboard del profesor."
    );
  }

  return data as TeacherDashboardCourse[];
}

export function useTeacherDashboard() {
  const { user } = useAuthStore();

  return useQuery<TeacherDashboardCourse[], Error>({
    queryKey: ["teacher-dashboard", user?.id],
    queryFn: () => fetchTeacherDashboardData(user?.id),
    enabled: !!user,
  });
}
