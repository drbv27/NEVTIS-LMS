// components/lessons/LessonView.tsx
"use client";

import { useLesson } from "@/hooks/useLesson";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
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

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Cargando lección...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        <p>Error: {error.message}</p>
      </div>
    );
  }
  if (!lessonData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>No se encontraron datos para esta lección.</p>
      </div>
    );
  }

  const { currentLesson, prevLessonId, nextLessonId, modules, courseTitle } =
    lessonData;

  return (
    <div className="flex h-screen bg-white">
      <LessonListSidebar
        modules={modules}
        courseId={courseId}
        currentLessonId={lessonId}
      />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu />
            </Button>
            <div>
              <Link
                href={`/courses/${courseId}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {courseTitle}
              </Link>
              <h1 className="text-lg font-bold truncate">
                {currentLesson.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* --- INICIO DE LA CORRECCIÓN --- */}

            {/* Botón "Anterior" */}
            {prevLessonId ? (
              <Button asChild variant="outline">
                <Link href={`/courses/${courseId}/lessons/${prevLessonId}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>
            )}

            {/* Botón "Siguiente" */}
            {nextLessonId ? (
              <Button asChild>
                <Link href={`/courses/${courseId}/lessons/${nextLessonId}`}>
                  Siguiente <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button disabled>
                Siguiente <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* --- FIN DE LA CORRECCIÓN --- */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <LessonContentPlayer lesson={currentLesson} />
        </main>
      </div>
    </div>
  );
}
