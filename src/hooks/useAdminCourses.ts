"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course } from "@/lib/types";

async function fetchAllCourses(): Promise<Course[]> {
  const supabase = createSupabaseBrowserClient();

  // --- INICIO DE LA CORRECCIÓN ---
  // Añadimos 'description' y 'image_url' a la consulta para que coincida con el tipo Course
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id, title, description, image_url, status, is_free, created_at, categories(name, slug)"
    )
    .order("created_at", { ascending: false });
  // --- FIN DE LA CORRECCIÓN ---

  if (error) throw new Error(error.message);

  const transformedData = data.map((course) => ({
    ...course,
    categories: Array.isArray(course.categories)
      ? course.categories[0]
      : course.categories,
  }));

  return transformedData as Course[];
}

export function useAdminCourses() {
  return useQuery<Course[], Error>({
    queryKey: ["admin-courses"],
    queryFn: fetchAllCourses,
  });
}
