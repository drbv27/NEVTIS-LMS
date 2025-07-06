// supabase/functions/submit-quiz/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Definimos la forma de los datos que esperamos recibir
interface Payload {
  quizId: string;
  answers: Record<string, string>; // { questionId: optionId, ... }
}

function createResponse(body: object, status: number = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    },
    status: status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createResponse({ message: "ok" });
  }

  try {
    const { quizId, answers }: Payload = await req.json();
    if (!quizId || !answers) {
      throw new Error("Se requiere el ID del quiz y las respuestas.");
    }

    const supabase = createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
    } = await createClient(
      Deno.env.get("PROJECT_URL")!,
      Deno.env.get("ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    ).auth.getUser();

    if (!user) throw new Error("Usuario no autenticado.");

    // 1. Obtenemos todas las preguntas y sus opciones correctas para este quiz
    const { data: correctAnswersData, error: correctAnswersError } =
      await supabase
        .from("quiz_questions")
        .select(`id, question_options!inner(id)`)
        .eq("quiz_id", quizId)
        .eq("question_options.is_correct", true);

    if (correctAnswersError) throw correctAnswersError;

    // 2. Calificamos las respuestas
    let correctCount = 0;
    const studentAnswersToSave = [];
    for (const question of correctAnswersData) {
      const correctAnswerId = question.question_options[0]?.id;
      const studentAnswerId = answers[question.id];
      const isCorrect = correctAnswerId === studentAnswerId;
      if (isCorrect) {
        correctCount++;
      }
      studentAnswersToSave.push({
        question_id: question.id,
        selected_option_id: studentAnswerId || null,
        is_correct: isCorrect,
      });
    }

    const totalQuestions = correctAnswersData.length;
    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // 3. Guardamos el intento del estudiante
    const { data: attemptData, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score: score,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (attemptError) throw attemptError;

    // 4. Asociamos las respuestas guardadas con el ID del intento
    const finalAnswers = studentAnswersToSave.map((answer) => ({
      ...answer,
      attempt_id: attemptData.id,
    }));

    // 5. Guardamos todas las respuestas del estudiante
    const { error: studentAnswersError } = await supabase
      .from("student_answers")
      .insert(finalAnswers);

    if (studentAnswersError) throw studentAnswersError;

    // 6. Devolvemos el resultado
    return createResponse({
      score: score.toFixed(2),
      correctCount,
      totalQuestions,
    });
  } catch (error) {
    return createResponse(
      { error: `Error interno de la función: ${error.message}` },
      500
    );
  }
});
