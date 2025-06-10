// hooks/useCourses.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course, type Category } from "@/lib/types";

async function fetchCourses(categorySlug: string | null) {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("courses")
    .select(
      "id, title, description, image_url, is_free, categories ( name, slug )"
    )
    .eq("status", "published");

  if (categorySlug) {
    // Esta es una forma más directa y eficiente de filtrar por el slug de la categoría relacionada
    query = query.eq("categories.slug", categorySlug);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // --- INICIO DE LA CORRECCIÓN ---
  // Transformamos los datos para que coincidan con nuestro tipo 'Course'
  const transformedData = data.map((course) => {
    // Supabase puede devolver la relación como un objeto o un array.
    // Nos aseguramos de manejar ambos casos y quedarnos con un solo objeto.
    const categoryObject = Array.isArray(course.categories)
      ? course.categories[0]
      : course.categories;

    return {
      ...course,
      categories: categoryObject || null,
    };
  });
  // --- FIN DE LA CORRECCIÓN ---

  return transformedData as Course[];
}

// La función fetchCategories y el hook useCourses no necesitan cambios.
async function fetchCategories() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return data as Category[];
}

export function useCourses(categorySlug: string | null) {
  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses", categorySlug],
    queryFn: () => fetchCourses(categorySlug),
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60,
  });

  return {
    courses: courses || [],
    categories: categories || [],
    isLoading: isLoadingCourses || isLoadingCategories,
    error: coursesError || categoriesError,
  };
}
