// src/hooks/useAdminDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Definimos la forma de los datos que devolverá el hook
export interface AdminDashboardStats {
  total_users: number;
  total_communities: number;
  total_courses: number;
  total_published_courses: number;
}

async function fetchAdminDashboardData(
  userId: string | undefined
): Promise<AdminDashboardStats | null> {
  if (!userId) return null;

  const supabase = createSupabaseBrowserClient();

  // --- LÍNEA RESTAURADA ---
  // Esta línea es la que obtiene los datos y el error.
  const { data, error } = await supabase
    .rpc("get_admin_dashboard_stats")
    .single();
  // --- FIN DE LA RESTAURACIÓN ---

  if (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw new Error("No se pudieron cargar las estadísticas del dashboard.");
  }

  // Le decimos a TypeScript que confíe en que 'data' tiene la forma de 'AdminDashboardStats'
  return data as AdminDashboardStats | null;
}

export function useAdminDashboard() {
  const { user } = useAuthStore();

  return useQuery<AdminDashboardStats | null, Error>({
    queryKey: ["admin-dashboard", user?.id],
    queryFn: () => fetchAdminDashboardData(user?.id),
    enabled: !!user,
  });
}
