// src/hooks/useQuizMutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { type QuizQuestion } from "./useQuizEditor";

// --- PAYLOADS ---
interface CreateQuizPayload {
  lessonId: number;
  title: string;
  description?: string;
}

interface AddQuestionPayload {
  quizId: string;
  lessonId: number;
  questionText: string;
  questionType: QuizQuestion["question_type"];
  options: { option_text: string; is_correct: boolean }[];
}

export interface SubmitQuizPayload {
  quizId: string;
  answers: Record<string, string>;
}

export interface QuizResult {
  score: string;
  correctCount: number;
  totalQuestions: number;
}

interface DeleteQuestionPayload {
  questionId: string;
  lessonId: number;
}

interface UpdateQuestionPayload {
  lessonId: number;
  questionId: string;
  questionText: string;
  options: {
    id?: string;
    option_text: string;
    is_correct: boolean;
  }[];
}

// --- FUNCIONES ASÍNCRONAS ---

async function createQuizFn(payload: CreateQuizPayload) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("quizzes").insert({
    lesson_id: payload.lessonId,
    title: payload.title,
    description: payload.description,
  });
  if (error) throw new Error("No se pudo crear el quiz.");
}

async function addQuestionFn(payload: AddQuestionPayload) {
  const supabase = createSupabaseBrowserClient();
  const { count, error: countError } = await supabase
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", payload.quizId);
  if (countError)
    throw new Error("No se pudo determinar el orden de la pregunta.");
  const questionOrder = (count || 0) + 1;

  const { data: newQuestion, error: questionError } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: payload.quizId,
      question_text: payload.questionText,
      question_type: payload.questionType,
      question_order: questionOrder,
    })
    .select("id")
    .single();
  if (questionError)
    throw new Error(`No se pudo crear la pregunta: ${questionError.message}`);

  const optionsToInsert = payload.options.map((opt, index) => ({
    question_id: newQuestion.id,
    option_text: opt.option_text,
    is_correct: opt.is_correct,
    option_order: index + 1,
  }));

  const { error: optionsError } = await supabase
    .from("question_options")
    .insert(optionsToInsert);
  if (optionsError)
    throw new Error(
      `No se pudieron guardar las opciones: ${optionsError.message}`
    );
}

async function submitQuizFn(payload: SubmitQuizPayload): Promise<QuizResult> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.functions.invoke("submit-quiz", {
    body: payload,
  });

  if (error)
    throw new Error(
      `Error al invocar la función de calificación: ${error.message}`
    );
  if (data.error) throw new Error(data.error);

  return data;
}

async function deleteQuestionFn({ questionId }: DeleteQuestionPayload) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    throw new Error(`No se pudo eliminar la pregunta: ${error.message}`);
  }
}

async function updateQuestionFn(payload: UpdateQuestionPayload) {
  const supabase = createSupabaseBrowserClient();

  const { error: questionUpdateError } = await supabase
    .from("quiz_questions")
    .update({ question_text: payload.questionText })
    .eq("id", payload.questionId);

  if (questionUpdateError) {
    throw new Error(
      `Error al actualizar el texto de la pregunta: ${questionUpdateError.message}`
    );
  }

  const { error: deleteOptionsError } = await supabase
    .from("question_options")
    .delete()
    .eq("question_id", payload.questionId);

  if (deleteOptionsError) {
    throw new Error(
      `Error al limpiar las opciones antiguas: ${deleteOptionsError.message}`
    );
  }

  const optionsToInsert = payload.options.map((opt, index) => ({
    question_id: payload.questionId,
    option_text: opt.option_text,
    is_correct: opt.is_correct,
    option_order: index + 1,
  }));

  const { error: insertOptionsError } = await supabase
    .from("question_options")
    .insert(optionsToInsert);

  if (insertOptionsError) {
    throw new Error(
      `Error al insertar las nuevas opciones: ${insertOptionsError.message}`
    );
  }
}

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const { mutate: createQuiz, isPending: isCreatingQuiz } = useMutation({
    mutationFn: createQuizFn,
    onSuccess: (_, variables) => {
      toast.success("¡Quiz creado con éxito!");
      queryClient.invalidateQueries({
        queryKey: ["quiz-editor", variables.lessonId],
      });
    },
    onError: (error) => {
      toast.error(error.message); // CORRECCIÓN: Se cambió la coma por punto y coma.
    },
  });

  const { mutate: addQuestion, isPending: isAddingQuestion } = useMutation({
    mutationFn: addQuestionFn,
    onSuccess: (_, variables) => {
      toast.success("Pregunta añadida con éxito.");
      queryClient.invalidateQueries({
        queryKey: ["quiz-editor", variables.lessonId],
      });
    },
    onError: (error) => {
      toast.error(error.message); // CORRECCIÓN: Se cambió la coma por punto y coma.
    },
  });

  const { mutate: submitQuiz, isPending: isSubmittingQuiz } = useMutation<
    QuizResult,
    Error,
    SubmitQuizPayload
  >({
    mutationFn: submitQuizFn,
    onError: (error) => {
      toast.error(`Error al enviar el quiz: ${error.message}`);
    },
  });

  const { mutate: deleteQuestion, isPending: isDeletingQuestion } = useMutation<
    void,
    Error,
    DeleteQuestionPayload
  >({
    mutationFn: deleteQuestionFn,
    onSuccess: (_, variables) => {
      toast.success("Pregunta eliminada correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["quiz-editor", variables.lessonId],
      });
    },
    onError: (error) => {
      toast.error(error.message); // CORRECCIÓN: Se cambió la coma por punto y coma.
    },
  });

  const { mutate: updateQuestion, isPending: isUpdatingQuestion } = useMutation<
    void,
    Error,
    UpdateQuestionPayload
  >({
    mutationFn: updateQuestionFn,
    onSuccess: (_, variables) => {
      toast.success("Pregunta actualizada con éxito.");
      queryClient.invalidateQueries({
        queryKey: ["quiz-editor", variables.lessonId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createQuiz,
    isCreatingQuiz,
    addQuestion,
    isAddingQuestion,
    submitQuiz,
    isSubmittingQuiz,
    deleteQuestion,
    isDeletingQuestion,
    updateQuestion,
    isUpdatingQuestion,
  };
}
