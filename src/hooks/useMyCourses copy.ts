//src/hooks/useMyCourses.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type Course } from "@/lib/types";

// La función que obtiene los datos, ahora con la lógica de transformación correcta
async function fetchMyCourses(userId?: string): Promise<Course[]> {
  if (!userId) return [];

  const supabase = createSupabaseBrowserClient();

  // Esta consulta está bien, el problema es cómo procesamos su resultado.
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      courses (
        id,
        title,
        description,
        image_url,
        is_free,
        categories ( name, slug )
      )
    `
    )
    .eq("student_id", userId);

  if (error) {
    console.error("Error fetching enrolled courses:", error);
    throw new Error(error.message);
  }

  if (!data) return [];

  // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---

  // 1. Usamos flatMap para extraer y aplanar la lista de cursos.
  //    Esto convierte el array de arrays en un solo array de cursos.
  const coursesFromEnrollments = data.flatMap(
    (enrollment) => enrollment.courses || []
  );

  // 2. Transformamos la propiedad 'categories' de cada curso, igual que en useCourses.ts
  const correctlyTypedCourses = coursesFromEnrollments
    .map((course) => {
      if (!course) return null; // Añadimos un chequeo de seguridad

      const categoryObject =
        Array.isArray(course.categories) && course.categories.length > 0
          ? course.categories[0]
          : course.categories;

      return {
        ...course,
        categories: categoryObject || null,
      };
    })
    .filter(Boolean); // Filtramos cualquier posible nulo

  return correctlyTypedCourses as Course[];
  // --- FIN DE LA CORRECCIÓN DEFINITIVA ---
}

// El hook no necesita cambios
export function useMyCourses() {
  const { user } = useAuthStore();

  return useQuery<Course[], Error>({
    queryKey: ["my-courses", user?.id],
    queryFn: () => fetchMyCourses(user?.id),
    enabled: !!user,
  });
}
