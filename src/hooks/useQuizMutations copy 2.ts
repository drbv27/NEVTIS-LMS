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

// --- INICIO DE NUEVOS PAYLOADS Y TIPOS ---
export interface SubmitQuizPayload {
  quizId: string;
  answers: Record<string, string>;
}

export interface QuizResult {
  score: string;
  correctCount: number;
  totalQuestions: number;
}

// NUEVO: Definimos el payload para la eliminación de una pregunta
interface DeleteQuestionPayload {
  questionId: string;
  lessonId: number; // Necesario para invalidar la caché correcta
}

// --- FUNCIONES ASÍNCRONAS ---

async function createQuizFn(payload: CreateQuizPayload) {
  // ... (código sin cambios)
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("quizzes").insert({
    lesson_id: payload.lessonId,
    title: payload.title,
    description: payload.description,
  });
  if (error) throw new Error("No se pudo crear el quiz.");
}

async function addQuestionFn(payload: AddQuestionPayload) {
  // ... (código sin cambios)
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

// --- NUEVA FUNCIÓN PARA ENVIAR EL QUIZ ---
async function submitQuizFn(payload: SubmitQuizPayload): Promise<QuizResult> {
  // ... (código sin cambios)
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

// NUEVO: Función asíncrona para eliminar una pregunta
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

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const { mutate: createQuiz, isPending: isCreatingQuiz } = useMutation({
    // ... (código sin cambios)
    mutationFn: createQuizFn,
    onSuccess: (_, variables) => {
      toast.success("¡Quiz creado con éxito!");
      queryClient.invalidateQueries({
        queryKey: ["quiz-editor", variables.lessonId],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: addQuestion, isPending: isAddingQuestion } = useMutation({
    // ... (código sin cambios)
    mutationFn: addQuestionFn,
    onSuccess: (_, variables) => {
      toast.success("Pregunta añadida con éxito.");
      queryClient.invalidateQueries({
        queryKey: ["quiz-editor", variables.lessonId],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  // --- NUEVA MUTACIÓN ---
  const { mutate: submitQuiz, isPending: isSubmittingQuiz } = useMutation<
    QuizResult,
    Error,
    SubmitQuizPayload
  >({
    // ... (código sin cambios)
    mutationFn: submitQuizFn,
    onError: (error) => {
      toast.error(`Error al enviar el quiz: ${error.message}`);
    },
  });

  // NUEVO: Añadimos la mutación para eliminar la pregunta
  const { mutate: deleteQuestion, isPending: isDeletingQuestion } = useMutation<
    void,
    Error,
    DeleteQuestionPayload
  >({
    mutationFn: deleteQuestionFn,
    onSuccess: (_, variables) => {
      toast.success("Pregunta eliminada correctamente.");
      // Invalidamos la caché del editor de quizzes para esa lección para que la UI se refresque
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
    // NUEVO: Exportamos las nuevas funciones desde el hook
    deleteQuestion,
    isDeletingQuestion,
  };
}
