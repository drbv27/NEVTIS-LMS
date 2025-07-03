// src/hooks/useCourses.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course, type Category } from "@/lib/types";

// La función de fetching ahora acepta un segundo parámetro: communitySlug
async function fetchCourses(
  categorySlug: string | null,
  communitySlug: string | null // <-- Nuevo parámetro
) {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("courses")
    .select(
      "id, title, description, image_url, is_free, categories ( name, slug )"
    )
    .eq("status", "published");

  // --- LÓGICA DE FILTRADO MEJORADA ---

  // Si se proporciona un communitySlug, filtramos por él.
  if (communitySlug) {
    const { data: communityData, error: communityError } = await supabase
      .from("communities")
      .select("id")
      .eq("slug", communitySlug)
      .single();

    if (communityError || !communityData) {
      console.error(
        "Error o no se encontró la comunidad por slug",
        communityError
      );
      return []; // Devuelve vacío si la comunidad no existe
    }
    // Añadimos el filtro por el ID de la comunidad
    query = query.eq("community_id", communityData.id);
  }

  // El filtro de categoría sigue funcionando igual que antes
  if (categorySlug) {
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (categoryData) {
      query = query.eq("category_id", categoryData.id);
    } else {
      return [];
    }
  }
  // --- FIN DE LA LÓGICA DE FILTRADO ---

  const { data, error } = await query.order("title", { ascending: true });
  if (error) throw new Error(error.message);

  const transformedData = data.map((course) => ({
    ...course,
    categories: Array.isArray(course.categories)
      ? course.categories[0]
      : course.categories,
  }));

  return transformedData as Course[];
}

// ... (la función fetchCategories no cambia)
async function fetchCategories() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Category[];
}

// El hook ahora acepta el communitySlug y lo pasa a la query
export function useCourses(
  categorySlug: string | null,
  communitySlug: string | null // <-- Nuevo parámetro
) {
  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery({
    // La queryKey ahora incluye el communitySlug para un cacheo correcto
    queryKey: ["courses", categorySlug, communitySlug],
    queryFn: () => fetchCourses(categorySlug, communitySlug),
  });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories", communitySlug], // La query de categorías también debe depender de la comunidad
    queryFn: fetchCategories, // A futuro, podríamos filtrar categorías por comunidad
    staleTime: 1000 * 60 * 60,
  });

  return {
    courses: courses || [],
    categories: categories || [],
    isLoading: isLoadingCourses || isLoadingCategories,
    error: coursesError || categoriesError,
  };
}
