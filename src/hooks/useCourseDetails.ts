// src/hooks/useCourseDetails.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type CourseDetails, type Module, type Lesson } from "@/lib/types";
import { toast } from "sonner";

async function fetchCourseDetails(courseId: string, userId?: string) {
  const supabase = createSupabaseBrowserClient();

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select(
      `
      id, title, description, image_url, is_free, status, price, 
      stripe_price_id, community_id,
      categories ( id, name, slug ),
      profiles ( full_name ),
      modules ( id, title, module_order, lessons ( id, title, lesson_type, lesson_order ) )
      `
    )
    .eq("id", courseId)
    .single();

  if (courseError) throw new Error(courseError.message);

  let isEnrolled = false;
  if (userId) {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId)
      .eq("course_id", courseId);
    isEnrolled = (count ?? 0) > 0;
  }

  const modules = (courseData.modules as Module[])
    .map((mod: Module) => ({
      ...mod,
      lessons: (mod.lessons as Lesson[]).sort(
        (a: Lesson, b: Lesson) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0)
      ),
    }))
    .sort(
      (a: Module, b: Module) => (a.module_order ?? 0) - (b.module_order ?? 0)
    );

  const firstLesson = modules?.[0]?.lessons?.[0];

  // SOLUCIÓN DEFINITIVA:
  // Verificamos si 'profiles' es un array y tomamos el primer elemento.
  // Esto soluciona el error de conversión de tipos.
  const teacherProfile = Array.isArray(courseData.profiles)
    ? courseData.profiles[0]
    : courseData.profiles;

  const details: CourseDetails = {
    ...courseData,
    categories: Array.isArray(courseData.categories)
      ? courseData.categories[0]
      : courseData.categories,
    teacherName: teacherProfile?.full_name || null,
    modules,
    isEnrolled,
    firstLessonId: firstLesson?.id || null,
  };

  return details;
}

export function useCourseDetails(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId, user?.id],
    queryFn: () => fetchCourseDetails(courseId, user?.id),
    enabled: !!courseId,
  });

  const { mutate: enrollInCourse, isPending: isEnrolling } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Debes iniciar sesión para inscribirte.");

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("enrollments")
        .insert({ student_id: user.id, course_id: courseId });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("¡Inscripción exitosa!");
      queryClient.invalidateQueries({
        queryKey: ["course", courseId, user?.id],
      });
    },
    onError: (err) => {
      toast.error(`Error al inscribirte: ${err.message}`);
    },
  });

  return { course, isLoading, error, enrollInCourse, isEnrolling };
}
