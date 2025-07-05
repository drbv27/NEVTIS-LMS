// src/components/admin/CreateLessonForm.tsx
"use client";

import { useState } from "react";
import { useCourseMutations } from "@/hooks/useCourseMutations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { PlusCircle } from "lucide-react";
import { Lesson } from "@/lib/types";
import TiptapEditor from "../shared/TiptapEditor";
import CodeEditor from "../shared/CodeEditor"; // <-- 1. IMPORTAMOS NUESTRO EDITOR
import { toast } from "sonner";

interface CreateLessonFormProps {
  moduleId: string;
  courseId: string;
}

export default function CreateLessonForm({
  moduleId,
  courseId,
}: CreateLessonFormProps) {
  const { createLesson, isCreatingLesson } = useCourseMutations();

  // Estados generales
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonType, setLessonType] = useState<Lesson["lesson_type"] | "">("");

  // Estados específicos de contenido
  const [file, setFile] = useState<File | null>(null);
  const [contentText, setContentText] = useState("");

  // --- 2. NUEVOS ESTADOS PARA LA LECCIÓN DE CÓDIGO ---
  const [setupCode, setSetupCode] = useState(
    "function miFuncion() {\n  // Tu código aquí\n}"
  );
  const [solutionCode, setSolutionCode] = useState(
    "function miFuncion() {\n  return true;\n}"
  );
  const [testCode, setTestCode] = useState(
    "const assert = require('assert');\nassert.strictEqual(miFuncion(), true, 'El resultado debe ser true');"
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLessonType("");
    setFile(null);
    setContentText("");
    // Limpiamos los inputs de archivo y código
    const fileInput = document.getElementById(
      `file-input-${moduleId}`
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setSetupCode("function miFuncion() {\n  // Tu código aquí\n}");
    setSolutionCode("function miFuncion() {\n  return true;\n}");
    setTestCode(
      "const assert = require('assert');\nassert.strictEqual(miFuncion(), true, 'El resultado debe ser true');"
    );
  };

  const handleAddLesson = () => {
    if (!title || !lessonType) return;

    // ... (Validaciones para video, pdf y texto no cambian)
    if ((lessonType === "video" || lessonType === "pdf") && !file) {
      return toast.error("Por favor, selecciona un archivo para subir.");
    }
    if (lessonType === "text" && !contentText.trim()) {
      return toast.error("El contenido de texto no puede estar vacío.");
    }

    // Pasamos todos los campos de código a la mutación
    createLesson(
      {
        title,
        description,
        moduleId,
        courseId,
        lessonType,
        file,
        contentText,
        setup_code: lessonType === "code" ? setupCode : null,
        solution_code: lessonType === "code" ? solutionCode : null,
        test_code: lessonType === "code" ? testCode : null,
      },
      { onSuccess: resetForm }
    );
  };

  return (
    <div className="p-4 bg-muted/50 border-t mt-4 space-y-4">
      <h5 className="text-sm font-semibold">Añadir Nueva Lección</h5>
      {/* ... (Inputs de título, descripción y tipo no cambian) ... */}
      <div className="space-y-2">
        <Label htmlFor={`title-${moduleId}`}>Título de la lección</Label>
        <Input
          id={`title-${moduleId}`}
          placeholder="Ej: ¿Qué es una variable?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreatingLesson}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`desc-${moduleId}`}>Descripción corta</Label>
        <Textarea
          id={`desc-${moduleId}`}
          placeholder="Una breve introducción a la lección..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreatingLesson}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo de Contenido</Label>
        <Select
          onValueChange={(value) =>
            setLessonType(value as Lesson["lesson_type"])
          }
          value={lessonType}
          disabled={isCreatingLesson}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">📹 Video</SelectItem>
            <SelectItem value="pdf">📄 PDF</SelectItem>
            <SelectItem value="text">📝 Texto Enriquecido</SelectItem>
            <SelectItem value="quiz">🧠 Quiz (próximamente)</SelectItem>
            <SelectItem value="code">💻 Código</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- 3. RENDERIZADO CONDICIONAL DE CAMPOS --- */}
      {lessonType === "text" && (
        <div className="space-y-2">
          <Label>Contenido del Texto</Label>
          <TiptapEditor content={contentText} onChange={setContentText} />
        </div>
      )}
      {(lessonType === "video" || lessonType === "pdf") && (
        <div className="space-y-2">
          <Label>Subir Archivo</Label>
          <Input
            id={`file-input-${moduleId}`}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isCreatingLesson}
            accept={lessonType === "video" ? "video/*" : "application/pdf"}
          />
        </div>
      )}
      {lessonType === "code" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Instrucciones (Usando el editor de texto enriquecido)</Label>
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
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleAddLesson}
          size="sm"
          disabled={isCreatingLesson || !title || !lessonType}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isCreatingLesson ? "Añadiendo..." : "Añadir Lección"}
        </Button>
      </div>
    </div>
  );
}
