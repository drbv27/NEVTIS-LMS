// src/components/lessons/CodeLessonPlayer.tsx
"use client";

import { useState, useEffect } from "react"; // <-- 1. IMPORTAMOS useEffect
import { type Lesson } from "@/lib/types";
import CodeEditor from "@/components/shared/CodeEditor";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";

interface CodeLessonPlayerProps {
  lesson: Lesson;
}

export default function CodeLessonPlayer({ lesson }: CodeLessonPlayerProps) {
  console.log("1. El componente se renderiza. La lección recibida es:", lesson);
  const [studentCode, setStudentCode] = useState(lesson.setup_code || "");

  // --- INICIO DE LA CORRECCIÓN ---
  // 2. AÑADIMOS ESTE useEffect
  // Este efecto se ejecutará cada vez que la propiedad 'lesson' cambie.
  // Esto asegura que si navegamos y volvemos, el estado del editor
  // se reinicie con el código correcto que viene de la caché.
  useEffect(() => {
    console.log(
      "2. useEffect se dispara. El setup_code es:",
      lesson.setup_code
    );
    setStudentCode(lesson.setup_code || "");
  }, [lesson.setup_code]);
  // --- FIN DE LA CORRECCIÓN ---

  const handleRunCode = () => {
    alert("Ejecutando el código... (funcionalidad pendiente)");
  };

  const handleResetCode = () => {
    setStudentCode(lesson.setup_code || "");
  };

  return (
    // ... el resto del JSX no cambia ...
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
        <div className="p-4 border-b shrink-0">
          <h3 className="text-lg font-semibold">Instrucciones</h3>
        </div>
        <div
          className="prose dark:prose-invert max-w-none p-4 overflow-y-auto"
          dangerouslySetInnerHTML={{
            __html:
              lesson.content_text || "No hay instrucciones para esta lección.",
          }}
        />
      </div>
      <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b shrink-0">
          <h3 className="text-lg font-semibold pl-2">Tu Solución</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetCode}
              title="Resetear Código"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Resetear
            </Button>
            <Button size="sm" onClick={handleRunCode}>
              <Play className="mr-2 h-4 w-4" />
              Ejecutar Pruebas
            </Button>
          </div>
        </div>
        <div className="flex-grow relative">
          <CodeEditor
            value={studentCode}
            onChange={setStudentCode}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
