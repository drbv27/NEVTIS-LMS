// src/components/admin/QuizEditor.tsx
"use client";

import { useState } from "react";
import { useQuizEditor, type QuizQuestion } from "@/hooks/useQuizEditor";
import { useQuizMutations } from "@/hooks/useQuizMutations";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  PlusCircle,
  Loader2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import AddQuestionForm from "./AddQuestionForm";
import EditQuestionDialog from "./EditQuestionDialog"; // <-- 1. IMPORTAR
import DeleteQuestionAlert from "./DeleteQuestionAlert"; // <-- 2. IMPORTAR
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuizEditorProps {
  lessonId: number;
}

export default function QuizEditor({ lessonId }: QuizEditorProps) {
  const { data: quiz, isLoading, error } = useQuizEditor(lessonId);
  const { createQuiz, isCreatingQuiz } = useQuizMutations();

  // --- 3. AÑADIR ESTADOS PARA LOS DIÁLOGOS ---
  const [questionToEdit, setQuestionToEdit] = useState<QuizQuestion | null>(
    null
  );
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(
    null
  );

  const handleCreateQuiz = () => {
    createQuiz({
      lessonId: lessonId,
      title: "Nuevo Cuestionario",
      description:
        "Completa las siguientes preguntas para evaluar tus conocimientos.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error al cargar el quiz: {error.message}
      </p>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center bg-muted/50">
        <h3 className="text-lg font-semibold">
          Esta lección aún no tiene un quiz.
        </h3>
        <p className="text-sm text-muted-foreground">
          Crea un quiz para empezar a añadir preguntas.
        </p>
        <Button onClick={handleCreateQuiz} disabled={isCreatingQuiz}>
          {isCreatingQuiz ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          {isCreatingQuiz ? "Creando..." : "Crear Quiz"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold">{quiz.title}</h3>
          <p className="text-muted-foreground">
            {quiz.description ||
              "Edita las preguntas de tu quiz a continuación."}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Preguntas del Quiz</h4>
          {quiz.quiz_questions && quiz.quiz_questions.length > 0 ? (
            <ul className="space-y-3">
              {quiz.quiz_questions.map((q) => (
                <li
                  key={q.id}
                  className="p-3 border rounded-md bg-muted/30 flex justify-between items-start"
                >
                  <div>
                    <p className="font-medium">{q.question_text}</p>
                    <ul className="mt-2 space-y-1 pl-4">
                      {q.question_options.map((opt) => (
                        <li
                          key={opt.id}
                          className={`text-sm flex items-center gap-2 ${
                            opt.is_correct
                              ? "text-green-600 font-semibold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {opt.is_correct ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>{opt.option_text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* --- 4. AÑADIR MENÚ DE ACCIONES --- */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setQuestionToEdit(q)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setQuestionToDelete(q)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Este quiz aún no tiene preguntas.
            </p>
          )}
        </div>

        <AddQuestionForm quizId={quiz.id} lessonId={lessonId} />
      </div>

      {/* --- 5. RENDERIZAR DIÁLOGOS CONDICIONALMENTE --- */}
      {questionToEdit && (
        <EditQuestionDialog
          isOpen={!!questionToEdit}
          onOpenChange={() => setQuestionToEdit(null)}
          question={questionToEdit}
          lessonId={lessonId}
        />
      )}
      {questionToDelete && (
        <DeleteQuestionAlert
          isOpen={!!questionToDelete}
          onOpenChange={() => setQuestionToDelete(null)}
          question={questionToDelete}
          lessonId={lessonId}
        />
      )}
    </>
  );
}
