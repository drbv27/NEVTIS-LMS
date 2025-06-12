"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

interface CourseCompletionData {
  courseName: string;
}

async function fetchCompletionData(
  courseId: string,
  userId?: string
): Promise<CourseCompletionData> {
  if (!userId) {
    throw new Error("Acceso denegado. Usuario no autenticado.");
  }

  const supabase = createSupabaseBrowserClient();

  // 1. Verificamos que el usuario esté inscrito
  const { count: enrollmentCount, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", userId)
    .eq("course_id", courseId);

  if (enrollmentError) throw new Error("Error al verificar la inscripción.");
  if (enrollmentCount === 0)
    throw new Error("No estás inscrito en este curso.");

  // 2. Si está inscrito, obtenemos el nombre del curso
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();

  if (courseError || !courseData) {
    throw new Error("Curso no encontrado.");
  }

  return { courseName: courseData.title };
}

export function useCourseCompletion(courseId: string) {
  const { user } = useAuthStore();

  return useQuery<CourseCompletionData, Error>({
    queryKey: ["course-completion", courseId, user?.id],
    queryFn: () => fetchCompletionData(courseId, user?.id),
    enabled: !!user && !!courseId, // Solo se ejecuta si hay usuario y courseId
  });
}
