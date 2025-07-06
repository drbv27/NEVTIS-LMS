// src/components/admin/EditLessonDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useCourseMutations } from "@/hooks/useCourseMutations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Lesson } from "@/lib/types";
import TiptapEditor from "../shared/TiptapEditor";
import Link from "next/link";
import CodeEditor from "../shared/CodeEditor";
import QuizEditor from "./QuizEditor"; // <-- 1. IMPORTAR

interface EditLessonDialogProps {
  lesson: Lesson;
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditLessonDialog({
  lesson,
  courseId,
  isOpen,
  onOpenChange,
}: EditLessonDialogProps) {
  // Estados generales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Estados específicos de contenido
  const [file, setFile] = useState<File | null>(null);
  const [contentText, setContentText] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [testCode, setTestCode] = useState("");

  const { updateLesson, isUpdatingLesson } = useCourseMutations();

  // Sincroniza el estado del formulario cada vez que se abre con una nueva lección
  useEffect(() => {
    if (isOpen && lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || "");
      setContentText(lesson.content_text || "");
      setSetupCode(lesson.setup_code || "");
      setSolutionCode(lesson.solution_code || "");
      setTestCode(lesson.test_code || "");
      setFile(null);
    }
  }, [isOpen, lesson]);

  const handleUpdate = () => {
    // A futuro, esta mutación necesitará ser actualizada para guardar los datos del quiz
    updateLesson(
      {
        lessonId: lesson.id,
        courseId,
        title,
        description,
        file,
        contentText,
        setup_code: setupCode,
        solution_code: solutionCode,
        test_code: testCode,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  // Función para renderizar el editor de contenido correcto según el tipo de lección
  const renderContentEditor = () => {
    switch (lesson.lesson_type) {
      case "quiz":
        // Si la lección es un quiz, renderizamos nuestro nuevo componente
        return <QuizEditor lessonId={parseInt(lesson.id)} />;

      case "code":
        // Renderizamos los editores para una lección de código
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instrucciones</Label>
              <TiptapEditor content={contentText} onChange={setContentText} />
            </div>
            <div className="space-y-2">
              <Label>Código de Configuración (Setup)</Label>
              <CodeEditor value={setupCode} onChange={setSetupCode} />
            </div>
            <div className="space-y-2">
              <Label>Código de Solución</Label>
              <CodeEditor value={solutionCode} onChange={setSolutionCode} />
            </div>
            <div className="space-y-2">
              <Label>Código de Pruebas (Tests)</Label>
              <CodeEditor value={testCode} onChange={setTestCode} />
            </div>
          </div>
        );

      case "text":
        return <TiptapEditor content={contentText} onChange={setContentText} />;

      case "video":
      case "pdf":
        return (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Contenido actual:
            </p>
            {lesson.content_url ? (
              <Link
                href={lesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all block mb-4"
              >
                {lesson.content_url}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-4">
                No hay contenido de archivo asignado.
              </p>
            )}
            <Label htmlFor="edit-file" className="text-sm font-medium">
              Reemplazar archivo
            </Label>
            <Input
              id="edit-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept={
                lesson.lesson_type === "video" ? "video/*" : "application/pdf"
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Selecciona un archivo solo si deseas reemplazar el actual.
            </p>
          </div>
        );
      default:
        return <p>Tipo de lección no soportado para edición.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Lección: {lesson.title}</DialogTitle>
          <DialogDescription>
            Modifica los detalles y el contenido de esta lección.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="font-semibold">
              Contenido de la Lección ({lesson.lesson_type})
            </Label>
            {renderContentEditor()}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isUpdatingLesson}>
            {isUpdatingLesson ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
