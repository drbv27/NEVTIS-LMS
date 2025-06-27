// src/hooks/useCourseList.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Definimos un tipo ligero solo para la lista de cursos
interface CourseListItem {
  id: string;
  title: string;
}

// La función que obtiene la lista de cursos
async function fetchCourseList(): Promise<CourseListItem[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching course list:", error);
    throw new Error("No se pudo obtener la lista de cursos.");
  }

  return data;
}

// El hook que usaremos en el diálogo de edición
export function useCourseList() {
  return useQuery<CourseListItem[], Error>({
    queryKey: ["course-list"], // Clave única para la caché de esta lista
    queryFn: fetchCourseList,
  });
}
