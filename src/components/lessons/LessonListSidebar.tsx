//src/components/lessons/LessonListSidebar.tsx
"use client";

import Link from "next/link";
import { type Module } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LessonTypeIcon from "./LessonTypeIcon";
import { CheckCircle2 } from "lucide-react";

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
  const defaultModuleId = modules.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId)
  )?.id;

  return (
    // Se eliminan todas las clases de posicionamiento y transición.
    // Ahora es un componente simple que ocupa el espacio que le asigne su padre.
    <aside className="h-full flex-col border-r bg-card flex overflow-hidden">
      <div className="p-4 border-b shrink-0">
        <h3 className="text-lg font-semibold truncate">Contenido del Curso</h3>
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
                        {lesson.is_completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
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
