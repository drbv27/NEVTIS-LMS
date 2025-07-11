//src/components/lessons/LessonContentPlayer.tsx
"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import PdfViewer from "./PdfViewer";
import { type Lesson } from "@/lib/types";
import CodeLessonPlayer from "./CodeLessonPlayer";
import QuizPlayer from "./QuizPlayer";

interface LessonContentPlayerProps {
  lesson: Lesson;
  onQuizPassed: () => void;
}

export default function LessonContentPlayer({
  lesson,
  onQuizPassed,
}: LessonContentPlayerProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Cargando reproductor...
      </div>
    );
  }

  // Comprobación más robusta
  const hasContent = lesson.content_url || lesson.content_text;
  // Permitimos que los tipos 'code' y 'quiz' pasen aunque no tengan contenido inicial
  if (
    !hasContent &&
    lesson.lesson_type !== "code" &&
    lesson.lesson_type !== "quiz"
  ) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Contenido no disponible para esta lección.
      </div>
    );
  }

  switch (lesson.lesson_type) {
    case "video":
      return (
        <div className="w-full">
          <div className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              url={lesson.content_url!}
              controls={true}
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
            />
          </div>
        </div>
      );

    case "pdf":
      return <PdfViewer pdfUrl={lesson.content_url!} />;

    // --- INICIO DE NUEVOS CASOS ---
    case "text":
      if (!lesson.content_text) return <p>Contenido de texto no disponible.</p>;
      return (
        // --- INICIO DE LA CORRECCIÓN ---
        // La clase 'prose' de Tailwind Typography dará estilo a los h2, ul, li, etc.
        <div
          className="prose dark:prose-invert max-w-none p-4"
          dangerouslySetInnerHTML={{ __html: lesson.content_text }}
        />
        // --- FIN DE LA CORRECCIÓN ---
      );

    case "code":
      // Placeholder para el futuro editor de código
      return <CodeLessonPlayer lesson={lesson} />;

    case "quiz":
      return (
        <QuizPlayer
          lessonId={parseInt(lesson.id)}
          onQuizPassed={onQuizPassed}
        />
      );
    // --- FIN DE NUEVOS CASOS ---

    default:
      return (
        <div className="p-6 text-center text-muted-foreground">
          Tipo de lección '{lesson.lesson_type}' no soportado.
        </div>
      );
  }
}
