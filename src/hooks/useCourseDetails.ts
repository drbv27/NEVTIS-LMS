// hooks/useCourseDetails.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { type CourseDetails, type Module, type Lesson } from "@/lib/types";
import { toast } from "sonner";

// --- FUNCIÓN DE FETCHING PRINCIPAL ---
async function fetchCourseDetails(courseId: string, userId?: string) {
  const supabase = createSupabaseBrowserClient();

  // 1. Obtener los detalles completos del curso con sus módulos y lecciones
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select(
      `
      id, title, description, image_url, is_free,
      categories ( name, slug ),
      profiles ( full_name ),
      modules ( id, title, lessons ( id, title, lesson_type, lesson_order ) )
    `
    )
    .eq("id", courseId)
    .eq("status", "published")
    .single();

  if (courseError) throw new Error(courseError.message);

  // 2. Verificar la inscripción SOLO si hay un usuario logueado
  let isEnrolled = false;
  if (userId) {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", userId)
      .eq("course_id", courseId);
    isEnrolled = (count ?? 0) > 0;
  }

  // 3. Procesar y organizar los datos
  const modules = (courseData.modules as any[])
    .map((mod) => ({
      ...mod,
      lessons: mod.lessons.sort(
        (a: any, b: any) => a.lesson_order - b.lesson_order
      ),
    }))
    .sort((a: any, b: any) => a.module_order - b.module_order) as Module[];

  const firstLesson = modules?.[0]?.lessons?.[0];

  const details: CourseDetails = {
    ...courseData,
    categories: Array.isArray(courseData.categories)
      ? courseData.categories[0]
      : courseData.categories,
    teacherName: (courseData.profiles as any)?.full_name || null,
    modules,
    isEnrolled,
    firstLessonId: firstLesson?.id || null,
  };

  return details;
}

// --- EL HOOK PERSONALIZADO ---
export function useCourseDetails(courseId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // QUERY para obtener los datos
  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    // La clave incluye el userId para que la query se actualice si el usuario cambia (login/logout)
    queryKey: ["course", courseId, user?.id],
    queryFn: () => fetchCourseDetails(courseId, user?.id),
    enabled: !!courseId, // Solo se ejecuta si hay un courseId
  });

  // MUTATION para inscribirse en el curso (reemplaza la Server Action)
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
      // ¡La magia de React Query! Invalidamos la query del curso.
      // Esto hará que se vuelva a pedir la información y la UI se actualice sola.
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
