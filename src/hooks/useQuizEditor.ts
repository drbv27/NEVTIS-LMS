// src/hooks/useQuizEditor.ts
"use client";

import {
  useQuery /* , useMutation, useQueryClient */,
} from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

// Definimos los tipos para los datos del editor
// A futuro, podemos moverlos a types.ts si es necesario
export interface QuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type:
    | "multiple_choice_single"
    | "multiple_choice_multiple"
    | "true_false";
  question_options: QuizOption[];
}

export interface QuizEditorData {
  id: string;
  lesson_id: number;
  title: string;
  description: string | null;
  quiz_questions: QuizQuestion[];
}

// La función que obtiene todos los datos de un quiz para una lección
async function fetchQuizForLesson(
  lessonId: number
): Promise<QuizEditorData | null> {
  const supabase = createSupabaseBrowserClient();

  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .select(
      `
      id,
      lesson_id,
      title,
      description,
      quiz_questions (
        id,
        question_text,
        question_type,
        question_order,
        question_options (
          id,
          option_text,
          is_correct,
          option_order
        )
      )
    `
    )
    .eq("lesson_id", lessonId)
    .order("question_order", {
      foreignTable: "quiz_questions",
      ascending: true,
    })
    .order("option_order", {
      foreignTable: "quiz_questions.question_options",
      ascending: true,
    })
    .single();

  if (quizError) {
    // Si el error es "PGRST116", significa que no se encontró ningún quiz, lo cual no es un error real.
    if (quizError.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching quiz data:", quizError);
    throw new Error("No se pudieron cargar los datos del quiz.");
  }

  return quizData as QuizEditorData;
}

// El hook que usaremos en nuestra interfaz de edición
export function useQuizEditor(lessonId: number | null) {
  const { user } = useAuthStore();

  return useQuery<QuizEditorData | null, Error>({
    queryKey: ["quiz-editor", lessonId],
    queryFn: () => fetchQuizForLesson(lessonId!),
    enabled: !!user && !!lessonId,
  });
}
