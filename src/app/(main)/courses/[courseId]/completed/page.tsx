"use client";

import { useCourseCompletion } from "@/hooks/useCourseCompletion";
import CourseCompletionPage from "@/components/lessons/CourseCompletionPage";

export default function CourseCompletedPage({
  params,
}: {
  params: { courseId: string };
}) {
  // Usamos nuestro nuevo hook para obtener los datos del lado del cliente
  const { data, isLoading, error } = useCourseCompletion(params.courseId);

  // Manejamos los estados de carga y error
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Verificando tu logro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  // Si todo está bien, renderizamos el componente visual con los datos
  return (
    <CourseCompletionPage
      courseId={params.courseId}
      courseName={data?.courseName || ""}
    />
  );
}
