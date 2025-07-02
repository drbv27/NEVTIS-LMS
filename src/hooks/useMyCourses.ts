// src/hooks/useMyCourses.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type Course } from "@/lib/types";

// La función de fetching ahora necesita saber qué comunidad está activa
async function fetchMyCourses(
  userId: string | undefined,
  activeCommunityId: string | null
): Promise<Course[]> {
  // Si no hay usuario o no hay una comunidad activa seleccionada, no devolvemos cursos.
  if (!userId || !activeCommunityId) {
    return [];
  }

  const supabase = createSupabaseBrowserClient();

  // La consulta ahora es más simple:
  // Obtenemos todos los cursos que pertenecen a la comunidad activa.
  // La seguridad de si el usuario puede verlos o no ya está manejada por las RLS.
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      image_url,
      is_free,
      price,
      stripe_price_id,
      status,
      community_id,
      categories ( name, slug )
    `
    )
    .eq("community_id", activeCommunityId)
    .eq("status", "published");

  if (error) {
    console.error("Error fetching my courses:", error);
    throw new Error(error.message);
  }

  if (!data) return [];

  // Transformamos la propiedad 'categories' como ya sabemos
  const transformedData = data.map((course) => {
    const categoryObject = Array.isArray(course.categories)
      ? course.categories[0]
      : course.categories;
    return { ...course, categories: categoryObject || null };
  });

  return transformedData as Course[];
}

// El hook ahora depende del 'activeCommunityId' del store
export function useMyCourses() {
  const { user, activeCommunityId } = useAuthStore();

  return useQuery<Course[], Error>({
    // La queryKey ahora incluye el activeCommunityId.
    // Esto es CRUCIAL: si el usuario cambia de comunidad, React Query
    // automáticamente volverá a ejecutar esta query con el nuevo ID.
    queryKey: ["my-courses", user?.id, activeCommunityId],
    queryFn: () => fetchMyCourses(user?.id, activeCommunityId),
    // La query solo se ejecuta si hay un usuario y una comunidad activa.
    enabled: !!user && !!activeCommunityId,
  });
}
