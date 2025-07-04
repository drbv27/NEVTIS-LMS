// src/hooks/useStudentDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Definimos la forma de los datos que devolverá nuestro hook
export interface DashboardCourse {
  id: string;
  title: string;
  image_url: string | null;
  total_lessons: number;
  completed_lessons: number;
  community_slug: string | null;
  first_lesson_id: string | null;
}

async function fetchStudentDashboardData(
  userId: string | undefined
): Promise<DashboardCourse[]> {
  if (!userId) return [];

  const supabase = createSupabaseBrowserClient();

  // Usamos una RPC para obtener los datos de forma eficiente
  const { data, error } = await supabase.rpc("get_student_dashboard_data");

  if (error) {
    console.error("Error fetching student dashboard data:", error);
    throw new Error("No se pudieron cargar los datos del dashboard.");
  }

  return data as DashboardCourse[];
}

export function useStudentDashboard() {
  const { user } = useAuthStore();

  return useQuery<DashboardCourse[], Error>({
    queryKey: ["student-dashboard", user?.id],
    queryFn: () => fetchStudentDashboardData(user?.id),
    enabled: !!user,
  });
}
