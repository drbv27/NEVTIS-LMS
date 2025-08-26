//src/hooks/useAdminCourse.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// CORRECCIÓN: Añadimos 'Lesson' a la importación
import { type Course, type Module, type Lesson } from "@/lib/types";

// Definimos un tipo más completo para los datos que traerá el hook
export interface AdminCourseData extends Course {
  modules: Module[];
}

async function fetchCourseById(
  courseId: string
): Promise<AdminCourseData | null> {
  const supabase = createSupabaseBrowserClient();

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

  if (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }

  // CORRECCIÓN DEFINITIVA:
  // Le decimos a TypeScript la forma exacta de los datos que recibimos.
  // Así, ya no necesita adivinar y no habrá más errores de 'any'.
  const course = {
    ...data,
    categories: Array.isArray(data.categories)
      ? data.categories[0]
      : data.categories,
    modules: data.modules
      .map((mod: Module) => ({
        // Tipamos 'mod' como Module
        ...mod,
        lessons: mod.lessons.sort(
          (a: Lesson, b: Lesson) =>
            (a.lesson_order ?? 0) - (b.lesson_order ?? 0)
        ),
      }))
      .sort(
        (a: Module, b: Module) => (a.module_order ?? 0) - (b.module_order ?? 0)
      ),
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
