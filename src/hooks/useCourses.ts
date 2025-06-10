// hooks/useCourses.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course, type Category } from "@/lib/types";

// --- FUNCIÓN PARA OBTENER CURSOS (CORREGIDA) ---
async function fetchCourses(categorySlug: string | null) {
  const supabase = createSupabaseBrowserClient();

  // Empezamos la query base para todos los cursos publicados
  let query = supabase
    .from("courses")
    .select(
      "id, title, description, image_url, is_free, categories ( name, slug )"
    )
    .eq("status", "published");

  // --- INICIO DE LA CORRECCIÓN ---
  // Si hay un filtro de categoría, necesitamos el ID de esa categoría.
  if (categorySlug) {
    // 1. Obtenemos el ID de la categoría a partir de su slug.
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (categoryError) {
      console.error("Error fetching category ID:", categoryError);
      // Si no se encuentra la categoría, devolvemos un array vacío para no mostrar nada.
      return [];
    }

    if (categoryData) {
      // 2. Aplicamos el filtro usando el category_id en la tabla de cursos.
      query = query.eq("category_id", categoryData.id);
    } else {
      // Si el slug no corresponde a ninguna categoría, no devolvemos cursos.
      return [];
    }
  }
  // --- FIN DE LA CORRECCIÓN ---

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const transformedData = data.map((course) => {
    const categoryObject = Array.isArray(course.categories)
      ? course.categories[0]
      : course.categories;
    return { ...course, categories: categoryObject || null };
  });

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
