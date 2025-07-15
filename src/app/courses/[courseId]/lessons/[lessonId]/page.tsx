// src/app/courses/[courseId]/lessons/[lessonId]/page.tsx
import LessonView from "@/components/lessons/LessonView";
import { Suspense } from "react";

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  // Ocultaremos el layout principal (Navbar/Sidebar) para esta ruta específica.
  // Esto se puede hacer con un layout específico para esta ruta o ajustando el layout padre.
  // Por ahora, el componente LessonView ocupa toda la pantalla.
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <p>Cargando lección...</p>
        </div>
      }
    >
      <LessonView courseId={params.courseId} lessonId={params.lessonId} />
    </Suspense>
  );
}
