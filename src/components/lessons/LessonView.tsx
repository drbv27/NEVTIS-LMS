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
  const { data: lessonData, isLoading, error } = useLesson(courseId, lessonId);
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
        <p>No se encontraron datos.</p>
      </div>
    );
  }

  const { currentLesson, prevLessonId, nextLessonId, modules, courseTitle } =
    lessonData;

  return (
    <div
      className={`h-full lg:grid transition-all duration-300 ease-in-out ${
        isLessonSidebarOpen
          ? "lg:grid-cols-[18rem_1fr]"
          : "lg:grid-cols-[0rem_1fr]"
      }`}
    >
      <div className="hidden lg:block">
        <LessonListSidebar
          modules={modules}
          courseId={courseId}
          currentLessonId={lessonId}
        />
      </div>

      <div className="flex flex-col w-full overflow-hidden">
        <header className="flex items-center justify-between p-2 lg:p-4 border-b shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Botón para colapsar en DESKTOP */}
            <Button
              onClick={toggleLessonSidebar}
              variant="outline"
              size="icon"
              className="hidden lg:flex"
            >
              {isLessonSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>

            {/* --- INICIO DE LA CORRECCIÓN --- */}
            {/* Contenedor del título que ahora es visible siempre */}
            {/* min-w-0 es un truco de flexbox para que truncate funcione */}
            <div className="flex-1 flex flex-col min-w-0 mx-2">
              {/* El título del curso (breadcrumb) se oculta en pantallas extra pequeñas */}
              <Link
                href={`/courses/${courseId}`}
                className="hidden sm:block text-xs text-muted-foreground hover:text-primary truncate"
              >
                {courseTitle}
              </Link>
              {/* El título de la lección siempre es visible y se trunca si es muy largo */}
              <h1
                className="text-md sm:text-lg font-bold truncate"
                title={currentLesson.title}
              >
                {currentLesson.title}
              </h1>
            </div>
            {/* --- FIN DE LA CORRECCIÓN --- */}
          </div>

          <div className="flex items-center gap-2">
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-2 sm:p-4">
            <LessonContentPlayer lesson={currentLesson} />
          </div>
        </main>
      </div>
    </div>
  );
}
