// components/lessons/LessonListSidebar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { type Module } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LessonTypeIcon from "./LessonTypeIcon";

interface LessonListSidebarProps {
  modules: Module[];
  courseId: string;
  currentLessonId: string;
}

export default function LessonListSidebar({
  modules,
  courseId,
  currentLessonId,
}: LessonListSidebarProps) {
  // Solo necesita saber si está abierta para la transición de opacidad
  const { isLessonSidebarOpen } = useAuthStore();
  const defaultModuleId = modules.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId)
  )?.id;

  // El control del ancho (w-80 vs w-0) se manejará en el layout padre con CSS Grid
  return (
    <aside className="h-full flex-col border-r bg-card hidden lg:flex transition-all duration-300 ease-in-out overflow-hidden">
      {/* El contenido de la barra se desvanece al ocultarse */}
      <div
        className={`h-full flex flex-col min-w-[20rem] transition-opacity duration-300 ${
          isLessonSidebarOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold truncate">
            Contenido del Curso
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={defaultModuleId}
          >
            {modules.map((module) => (
              <AccordionItem value={module.id} key={module.id}>
                <AccordionTrigger className="px-4 font-medium text-left hover:no-underline">
                  {module.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pt-1 pb-2 space-y-1 pr-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className={`flex items-center gap-3 p-3 text-sm transition-colors w-full rounded-md ${
                            lesson.id === currentLessonId
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <LessonTypeIcon type={lesson.lesson_type} />
                          <span className="flex-1">{lesson.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </aside>
  );
}
