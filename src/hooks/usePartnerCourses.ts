// src/hooks/usePartnerCourses.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";

// Esta función obtiene solo los cursos de las comunidades de un partner
async function fetchPartnerCourses(userId: string): Promise<Course[]> {
  const supabase = createSupabaseBrowserClient();

  // Paso 1: Obtener los IDs de las comunidades que pertenecen al partner.
  const { data: communitiesData, error: communitiesError } = await supabase
    .from("communities")
    .select("id")
    .eq("creator_id", userId);

  if (communitiesError) {
    console.error("Error fetching partner's communities:", communitiesError);
    throw new Error("Could not fetch the partner's communities.");
  }

  const communityIds = communitiesData.map((community) => community.id);

  // Si el partner no tiene comunidades, no hay nada que buscar.
  if (communityIds.length === 0) {
    return [];
  }

  // Paso 2: Usar la lista de IDs para obtener los cursos.
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, title, description, image_url, status, is_free,
      created_at, price, stripe_price_id, community_id,
      categories (id, name, slug)
    `
    )
    .in("community_id", communityIds) // <-- Ahora pasamos un array, que es lo correcto.
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching partner courses:", error);
    throw new Error("Could not fetch the courses list.");
  }

  const transformedData = data.map((course) => ({
    ...course,
    categories: Array.isArray(course.categories)
      ? course.categories[0]
      : course.categories,
  }));

  return transformedData as Course[];
}

// El hook que usará la nueva tabla del partner
export function usePartnerCourses() {
  const { user } = useAuthStore();

  return useQuery<Course[], Error>({
    queryKey: ["partner-courses", user?.id],
    queryFn: () => fetchPartnerCourses(user!.id),
    enabled: !!user,
  });
}
