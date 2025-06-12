"use client";

import { useLesson } from "@/hooks/useLesson";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
} from "lucide-react";
import LessonContentPlayer from "./LessonContentPlayer";
import LessonListSidebar from "./LessonListSidebar";

export default function LessonView({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const {
    data: lessonData,
    isLoading,
    error,
    markAsCompleted,
    isCompleting,
  } = useLesson(courseId, lessonId);
  const { isLessonSidebarOpen, toggleLessonSidebar } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando lección...</p>
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
  if (!lessonData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>No se encontraron datos para esta lección.</p>
      </div>
    );
  }

  const { currentLesson, prevLessonId, nextLessonId, modules, courseTitle } =
    lessonData;

  return (
    // --- INICIO DE LA CORRECCIÓN DEL LAYOUT ---
    // Usamos Flexbox, el mismo patrón robusto del layout principal.
    <div className="flex h-full">
      {/* Contenedor de la barra lateral de lecciones, su ancho y visibilidad se controlan aquí */}
      <div
        className={`transition-all duration-300 ease-in-out hidden lg:block ${
          isLessonSidebarOpen ? "w-80" : "w-0"
        }`}
      >
        <LessonListSidebar
          modules={modules}
          courseId={courseId}
          currentLessonId={lessonId}
        />
      </div>

      {/* Contenedor principal del contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-2 lg:p-4 border-b shrink-0 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              onClick={toggleLessonSidebar}
              variant="outline"
              size="icon"
              className="hidden lg:flex"
            >
              {isLessonSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <div className="flex-1 flex flex-col min-w-0">
              <Link
                href={`/courses/${courseId}`}
                className="hidden sm:block text-xs text-muted-foreground hover:text-primary truncate"
              >
                {courseTitle}
              </Link>
              <h1
                className="text-md sm:text-lg font-bold truncate"
                title={currentLesson.title}
              >
                {currentLesson.title}
              </h1>
            </div>
          </div>
          {/* Botones de acción ahora agrupados a la derecha */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="outline"
              size="icon"
              disabled={!prevLessonId}
            >
              <Link
                href={
                  prevLessonId
                    ? `/courses/${courseId}/lessons/${prevLessonId}`
                    : "#"
                }
                aria-label="Lección anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            {/* El botón de completar ahora está aquí, visible y accesible */}
            <Button
              onClick={() => markAsCompleted()}
              disabled={isCompleting || currentLesson.is_completed}
              variant={currentLesson.is_completed ? "secondary" : "default"}
            >
              {isCompleting ? (
                "Guardando..."
              ) : currentLesson.is_completed ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completada
                </>
              ) : nextLessonId ? (
                "Completar y Siguiente"
              ) : (
                "Finalizar curso"
              )}
            </Button>
            <Button asChild size="icon" disabled={!nextLessonId}>
              <Link
                href={
                  nextLessonId
                    ? `/courses/${courseId}/lessons/${nextLessonId}`
                    : "#"
                }
                aria-label="Siguiente lección"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-4 md:p-6">
            <LessonContentPlayer lesson={currentLesson} />
          </div>
        </main>
      </div>
    </div>
    // --- FIN DE LA CORRECCIÓN DEL LAYOUT ---
  );
}
