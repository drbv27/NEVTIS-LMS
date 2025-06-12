"use client";

import { useAdminCourse } from "@/hooks/useAdminCourse";
import CourseForm from "@/components/admin/CourseForm";

export default function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: course, isLoading } = useAdminCourse(params.courseId);

  if (isLoading) return <div>Cargando datos del curso...</div>;

  // Renderiza el mismo formulario, pero pasándole los datos iniciales del curso
  return <CourseForm initialData={course} />;
}
