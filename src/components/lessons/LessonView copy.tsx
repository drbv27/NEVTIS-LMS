// components/lessons/LessonView.tsx
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
  // Obtenemos el estado Y la acción para el botón
  const { isLessonSidebarOpen, toggleLessonSidebar } = useAuthStore();

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
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isLessonSidebarOpen
          ? "lg:grid-cols-[18rem_1fr]"
          : "lg:grid-cols-[0rem_1fr]"
      } lg:gap-8`}
    >
      <LessonListSidebar
        modules={modules}
        courseId={courseId}
        currentLessonId={lessonId}
      />

      <div className="flex-1 flex flex-col">
        {/* La cabecera de la lección ahora es más simple */}
        <div className="flex items-center justify-between p-2 mb-4 border-b">
          <Button
            onClick={toggleLessonSidebar}
            variant="outline"
            size="icon"
            className="hidden lg:flex"
          >
            {isLessonSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" disabled={!prevLessonId}>
              <Link
                href={
                  prevLessonId
                    ? `/courses/${courseId}/lessons/${prevLessonId}`
                    : "#"
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild disabled={!nextLessonId}>
              <Link
                href={
                  nextLessonId
                    ? `/courses/${courseId}/lessons/${nextLessonId}`
                    : "#"
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-4">
          <h1 className="text-2xl font-bold truncate">{currentLesson.title}</h1>
        </div>

        <main className="flex-1 overflow-y-auto mt-4">
          <LessonContentPlayer lesson={currentLesson} />
        </main>
      </div>
    </div>
  );
}
