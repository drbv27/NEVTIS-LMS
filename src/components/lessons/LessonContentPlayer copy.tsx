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

  // El content_url para texto es una equivocación, debería ser content_text
  // Si la lección no es de texto, y no hay URL, mostramos el mensaje.
  if (lesson.lesson_type !== "text" && !lesson.content_url) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Contenido no disponible para esta lección.
      </div>
    );
  }

  switch (lesson.lesson_type) {
    case "video":
      // --- INICIO DE LA CORRECCIÓN ---
      // Envolvemos el reproductor en un contenedor con padding y un ancho máximo.
      // Esto le da al ReactPlayer un espacio estable y definido para renderizarse, rompiendo el bucle.
      return (
        <div className="p-1 sm:p-4 md:p-6">
          <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <ReactPlayer
              url={lesson.content_url!} // Usamos '!' porque ya comprobamos que no es nulo arriba
              controls={true}
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
            />
          </div>
        </div>
      );
    // --- FIN DE LA CORRECCIÓN ---

    case "pdf":
      return <PdfViewer pdfUrl={lesson.content_url!} />;

    // ... el resto de los casos no cambian ...
    default:
      return (
        <div className="p-6 text-center text-muted-foreground">
          Tipo de lección '{lesson.lesson_type}' no soportado.
        </div>
      );
  }
}
