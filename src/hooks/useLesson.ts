//src/hooks/useLesson.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type LessonPageData, type Lesson, type Module } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

async function fetchLessonData(
  courseId: string,
  lessonId: string,
  userId?: string
): Promise<LessonPageData> {
  if (!userId) throw new Error("Acceso denegado. Debes iniciar sesión.");

  const supabase = createSupabaseBrowserClient();

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

  // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---
  // Se añade 'content_text' a la consulta para que coincida con nuestro tipo en types.ts
  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select(
      "id, title, description, lesson_type, content_url, content_text, lesson_order, module_id"
    )
    .in("module_id", moduleIds)
    .order("lesson_order", { ascending: true });
  // --- FIN DE LA CORRECCIÓN DEFINITIVA ---

  if (lessonsError)
    throw new Error(`Error al cargar las lecciones: ${lessonsError.message}`);

  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed")
    .eq("user_id", userId)
    .in(
      "lesson_id",
      lessonsData.map((l) => l.id)
    );

  const lessonsWithProgress = lessonsData.map((lesson) => {
    const progress = progressData?.find(
      (p) => String(p.lesson_id) === String(lesson.id)
    );
    return { ...lesson, is_completed: progress?.is_completed || false };
  });

  const modulesWithLessons: Module[] = modulesData.map((module) => ({
    ...module,
    lessons: lessonsWithProgress.filter(
      (lesson) => String(lesson.module_id) === String(module.id)
    ),
  }));

  const flatLessons: Lesson[] = modulesWithLessons.flatMap(
    (mod) => mod.lessons
  );
  const currentIndex = flatLessons.findIndex((l) => String(l.id) === lessonId);
  if (currentIndex === -1) throw new Error("Lección no encontrada.");

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
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const router = useRouter();

  const { data, isLoading, error } = useQuery<LessonPageData, Error>({
    queryKey: ["lesson", courseId, lessonId, user?.id],
    queryFn: () => fetchLessonData(courseId, lessonId, user?.id),
    enabled: !!user && !!courseId && !!lessonId,
  });

  const { mutate: markAsCompleted, isPending: isCompleting } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No autenticado");
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("lesson_progress")
        .upsert({
          user_id: user.id,
          lesson_id: parseInt(lessonId),
          is_completed: true,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success("¡Progreso guardado!");
      queryClient.invalidateQueries({ queryKey: ["lesson", courseId] });
      const nextLessonId = data?.nextLessonId;
      setTimeout(() => {
        if (nextLessonId) {
          router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
        } else {
          toast.info("¡Felicidades, has completado el curso!");
          router.push(`/courses/${courseId}/completed`);
        }
      }, 800);
    },
    onError: (err) => {
      toast.error(`Error al guardar progreso: ${err.message}`);
    },
  });

  return { data, isLoading, error, markAsCompleted, isCompleting };
}
