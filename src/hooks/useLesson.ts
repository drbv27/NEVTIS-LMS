// hooks/useLesson.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type LessonPageData, type Lesson, type Module } from "@/lib/types";

async function fetchLessonData(
  courseId: string,
  lessonId: string,
  userId?: string
): Promise<LessonPageData> {
  const supabase = createSupabaseBrowserClient();

  if (!userId) throw new Error("Acceso denegado. Debes iniciar sesión.");

  const { count: enrollmentCount, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", userId)
    .eq("course_id", courseId);

  if (enrollmentError) throw new Error("Error al verificar tu inscripción.");
  if (enrollmentCount === 0)
    throw new Error("Acceso denegado: No estás inscrito en este curso.");

  const { data: courseInfo, error: courseInfoError } = await supabase
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .single();
  if (courseInfoError) throw new Error("No se pudo encontrar el curso.");

  const { data: modulesData, error: modulesError } = await supabase
    .from("modules")
    .select("id, title, module_order")
    .eq("course_id", courseId)
    .order("module_order", { ascending: true });
  if (modulesError) throw new Error("Error al cargar los módulos.");

  const moduleIds = modulesData.map((m) => m.id);
  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, title, lesson_type, content_url, lesson_order, module_id")
    .in("module_id", moduleIds)
    .order("lesson_order", { ascending: true });

  if (lessonsError)
    throw new Error(`Error al cargar las lecciones: ${lessonsError.message}`);

  const modulesWithLessons: Module[] = modulesData.map((module) => ({
    ...module,
    lessons: lessonsData.filter(
      (lesson) => lesson.module_id === module.id
    ) as Lesson[],
  }));

  const flatLessons: Lesson[] = modulesWithLessons.flatMap(
    (mod) => mod.lessons
  );

  // --- INICIO DE LA CORRECCIÓN ---
  console.log(`Buscando lección con ID (texto): "${lessonId}"`);
  console.log(
    "Lecciones disponibles (IDs son números):",
    flatLessons.map((l) => ({ id: l.id, title: l.title }))
  );

  // Comparamos ambos valores como strings para evitar errores de tipo.
  const currentIndex = flatLessons.findIndex((l) => String(l.id) === lessonId);

  console.log("Índice encontrado:", currentIndex);
  // --- FIN DE LA CORRECCIÓN ---

  if (currentIndex === -1) {
    // Si después de la corrección sigue sin encontrarla, el problema es otro,
    // pero este es el error más probable.
    throw new Error("Lección no encontrada.");
  }

  const currentLesson = flatLessons[currentIndex];
  const prevLessonId =
    currentIndex > 0 ? String(flatLessons[currentIndex - 1].id) : null;
  const nextLessonId =
    currentIndex < flatLessons.length - 1
      ? String(flatLessons[currentIndex + 1].id)
      : null;

  return {
    courseTitle: courseInfo.title,
    modules: modulesWithLessons,
    currentLesson,
    prevLessonId,
    nextLessonId,
  };
}

export function useLesson(courseId: string, lessonId: string) {
  const { user } = useAuthStore();
  return useQuery<LessonPageData, Error>({
    queryKey: ["lesson", courseId, lessonId, user?.id],
    queryFn: () => fetchLessonData(courseId, lessonId, user?.id),
    enabled: !!user && !!courseId && !!lessonId,
  });
}
