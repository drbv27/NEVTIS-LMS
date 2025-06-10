// components/lessons/LessonContentPlayer.tsx
"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import PdfViewer from "./PdfViewer";
import { type Lesson } from "@/lib/types";

interface LessonContentPlayerProps {
  lesson: Lesson;
}

export default function LessonContentPlayer({
  lesson,
}: LessonContentPlayerProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="p-4 text-center">Cargando reproductor...</div>;
  }

  if (!lesson.content_url) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Contenido no disponible para esta lección.
      </div>
    );
  }

  switch (lesson.lesson_type) {
    case "video":
      return (
        <div className="relative w-full aspect-video bg-black">
          <ReactPlayer
            url={lesson.content_url}
            controls={true}
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
          />
        </div>
      );

    case "pdf":
      return <PdfViewer pdfUrl={lesson.content_url} />;

    // --- CORRECCIÓN ---
    // Se elimina el caso 'text' ya que la columna 'content_text' no existe.
    // Si en el futuro la añades, puedes volver a agregar esta lógica.

    default:
      return (
        <div className="p-6 text-center text-muted-foreground">
          Tipo de lección '{lesson.lesson_type}' no soportado.
        </div>
      );
  }
}
