// src/app/courses/[courseId]/page.tsx
"use client";

import { useCourseDetails } from "@/hooks/useCourseDetails";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCopy, MonitorPlay, FileText } from "lucide-react";
import { Module, Lesson } from "@/lib/types";
import { useRouter } from "next/navigation"; // <-- 1. IMPORTAMOS useRouter
import { useAuthStore } from "@/store/authStore"; // <-- 2. IMPORTAMOS useAuthStore
import NotFoundOrErrorPage from "@/components/shared/NotFoundOrErrorPage";

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const router = useRouter(); // <-- 3. INICIAMOS EL HOOK
  const { user } = useAuthStore(); // <-- 4. OBTENEMOS EL USUARIO DEL STORE
  const { course, isLoading, error, enrollInCourse, isEnrolling } =
    useCourseDetails(params.courseId);

  // 5. NUEVA FUNCIÓN PARA MANEJAR EL CLIC EN EL BOTÓN DE INSCRIPCIÓN
  const handleEnrollClick = () => {
    // Si no hay usuario, lo mandamos a login con un parámetro de redirección
    if (!user) {
      router.push(`/login?redirect=/courses/${params.courseId}`);
    } else {
      // Si sí hay usuario, ejecutamos la inscripción como antes
      enrollInCourse();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">Cargando detalles del curso...</div>
    );
  }
  if (error || !course) {
    return <NotFoundOrErrorPage />;
  }

  // Lógica para el botón de acción
  let actionButton;
  if (course.isEnrolled) {
    actionButton = (
      <Link
        href={
          course.firstLessonId
            ? `/courses/${course.id}/lessons/${course.firstLessonId}`
            : "#"
        }
      >
        <Button size="lg" className="w-full mt-6 text-lg">
          Ir al Curso / Continuar
        </Button>
      </Link>
    );
  } else if (course.is_free) {
    actionButton = (
      <Button
        size="lg"
        className="w-full mt-6 text-lg"
        onClick={handleEnrollClick} // <-- 6. USAMOS LA NUEVA FUNCIÓN AQUÍ
        disabled={isEnrolling}
      >
        {isEnrolling ? "Inscribiendo..." : "Inscribirse Gratis"}
      </Button>
    );
  } else {
    actionButton = (
      <Button size="lg" className="w-full mt-6 text-lg" disabled>
        Comprar Curso (Próximamente)
      </Button>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* El resto del JSX de la página no cambia */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-6">
            <Image
              src={course.image_url || "/images/placeholder.png"}
              alt={`Imagen de ${course.title}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-3 text-sm">
            {course.teacherName && (
              <p>
                <strong>Instructor:</strong> {course.teacherName}
              </p>
            )}
            {course.categories && (
              <div className="flex items-center gap-2">
                <strong>Categoría:</strong>{" "}
                <Badge variant="secondary">{course.categories.name}</Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <strong>Precio:</strong>{" "}
              {course.is_free ? (
                <Badge className="bg-green-100 text-green-800">Gratis</Badge>
              ) : (
                "De Pago"
              )}
            </div>
          </div>
          {actionButton}
        </div>

        <div className="lg:col-span-8 xl:col-span-9 mt-8 lg:mt-0">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">{course.description}</p>
          <div className="mt-10 pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-6">Contenido del Curso</h2>
            <div className="space-y-6">
              {course.modules.map((module: Module) => (
                <div
                  key={module.id}
                  className="p-6 border rounded-lg bg-card shadow-sm"
                >
                  <h3 className="text-xl font-semibold flex items-center mb-3">
                    <BookCopy className="mr-3 h-6 w-6 text-primary" />
                    {module.title}
                  </h3>
                  <ul className="space-y-2">
                    {module.lessons.map((lesson: Lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center p-2.5 rounded-md"
                      >
                        {lesson.lesson_type === "video" && (
                          <MonitorPlay className="mr-2 h-5 w-5 text-secondary" />
                        )}
                        {lesson.lesson_type === "pdf" && (
                          <FileText className="mr-2 h-5 w-5 text-secondary" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {lesson.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
