//src/app/(main)/admin/courses/[courseId]/edit/page.tsx
"use client";

import { useAdminCourse } from "@/hooks/useAdminCourse";
import CourseForm from "@/components/admin/CourseForm";
import ModuleList from "@/components/admin/ModuleList"; // <-- 1. Importamos el nuevo componente

export default function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: course, isLoading } = useAdminCourse(params.courseId);

  if (isLoading) return <div>Cargando datos del curso...</div>;

  return (
    // Usamos un div para envolver ambos componentes
    <div className="space-y-8">
      {/* 2. El formulario para editar los datos generales del curso */}
      <CourseForm initialData={course} />

      {/* 3. La nueva lista de módulos y lecciones */}
      {course && (
        <ModuleList modules={course.modules} courseId={params.courseId} />
      )}
    </div>
  );
}
