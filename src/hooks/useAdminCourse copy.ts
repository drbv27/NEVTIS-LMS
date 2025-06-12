"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Course } from "@/lib/types";

async function fetchCourseById(courseId: string): Promise<Course | null> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, categories(id, name, slug)")
    .eq("id", courseId)
    .single();

  if (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }

  const course = {
    ...data,
    categories: Array.isArray(data.categories)
      ? data.categories[0]
      : data.categories,
  };

  return course as Course;
}

export function useAdminCourse(courseId: string) {
  return useQuery<Course | null, Error>({
    queryKey: ["admin-course", courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId, // Solo se ejecuta si se proporciona un courseId
  });
}
