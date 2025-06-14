//src/components/admin/EditLessonDialog.tsx
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
import { Lesson } from "@/lib/types";
import TiptapEditor from "../shared/TiptapEditor";
import Link from "next/link";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [contentText, setContentText] = useState("");

  const { updateLesson, isUpdatingLesson } = useCourseMutations();

  // Sincroniza el estado del formulario cada vez que se abre con una nueva lección
  useEffect(() => {
    if (isOpen && lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || "");
      setContentText(lesson.content_text || "");
      setFile(null); // Resetea la selección de archivo cada vez que se abre
    }
  }, [isOpen, lesson]);

  const handleUpdate = () => {
    updateLesson(
      { lessonId: lesson.id, courseId, title, description, file, contentText },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
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
            <Label>Contenido ({lesson.lesson_type})</Label>

            {lesson.lesson_type === "text" ? (
              <TiptapEditor content={contentText} onChange={setContentText} />
            ) : (
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
                    lesson.lesson_type === "video"
                      ? "video/*"
                      : "application/pdf"
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Selecciona un archivo solo si deseas reemplazar el actual.
                </p>
              </div>
            )}
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
