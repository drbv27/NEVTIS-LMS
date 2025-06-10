// components/lessons/LessonListSidebar.tsx
"use client";

import Link from "next/link";
import { type Module } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LessonTypeIcon from "./LessonTypeIcon"; // <-- Importamos nuestro nuevo componente

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
  // Encontramos el módulo por defecto que contiene la lección actual
  const defaultModuleId = modules.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId)
  )?.id;

  return (
    <aside className="w-80 h-full flex-col border-r bg-card hidden lg:flex">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Contenido del Curso</h3>
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
              <AccordionTrigger className="px-4 font-medium text-left">
                {module.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 pr-2">
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
                        {/* --- INICIO DE LA CORRECCIÓN --- */}
                        {/* Usamos el componente dinámico en lugar de PlayCircle */}
                        <LessonTypeIcon type={lesson.lesson_type} />
                        {/* --- FIN DE LA CORRECCIÓN --- */}
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
    </aside>
  );
}
