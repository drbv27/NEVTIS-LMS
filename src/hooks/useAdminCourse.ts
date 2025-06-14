//src/hooks/useAdminCourse.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course, type Module } from "@/lib/types"; // Importamos Module

// Definimos un tipo más completo para los datos que traerá el hook
export interface AdminCourseData extends Course {
  modules: Module[];
}

async function fetchCourseById(
  courseId: string
): Promise<AdminCourseData | null> {
  const supabase = createSupabaseBrowserClient();

  // --- INICIO DE LA CORRECCIÓN ---
  // Modificamos el 'select' para que traiga los módulos y sus lecciones anidadas
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      categories (id, name, slug),
      modules (
        *,
        lessons (*)
      )
    `
    )
    .eq("id", courseId)
    .order("module_order", { referencedTable: "modules" })
    .order("lesson_order", { referencedTable: "modules.lessons" })
    .single();
  // --- FIN DE LA CORRECCIÓN ---

  if (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }

  // Hacemos la misma transformación de 'categories' que ya conocemos
  const course = {
    ...data,
    categories: Array.isArray(data.categories)
      ? data.categories[0]
      : data.categories,
    // Nos aseguramos de que los módulos y lecciones estén ordenados
    modules: (data.modules as any[])
      .map((mod) => ({
        ...mod,
        lessons: (mod.lessons as any[]).sort(
          (a, b) => a.lesson_order - b.lesson_order
        ),
      }))
      .sort((a, b) => a.module_order - b.module_order),
  };

  return course as AdminCourseData;
}

export function useAdminCourse(courseId: string) {
  return useQuery<AdminCourseData | null, Error>({
    queryKey: ["admin-course", courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId,
  });
}
