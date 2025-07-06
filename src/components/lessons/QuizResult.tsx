// src/components/lessons/QuizResult.tsx
"use client";

import { type QuizResult } from "@/hooks/useQuizMutations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Award, RotateCcw } from "lucide-react";
import { Progress } from "../ui/progress";

interface QuizResultProps {
  result: QuizResult;
  onRetry: () => void;
  onContinue: () => void;
}

export default function QuizResultDisplay({
  result,
  onRetry,
  onContinue,
}: QuizResultProps) {
  const score = parseFloat(result.score);
  const isSuccess = score >= 70; // Definimos 70 como la nota para aprobar

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="text-center">
        <CardHeader>
          <Award
            className={`mx-auto h-16 w-16 ${
              isSuccess ? "text-yellow-500" : "text-muted-foreground"
            }`}
          />
          <CardTitle className="text-3xl font-bold mt-4">
            {isSuccess ? "¡Felicidades!" : "Sigue Intentando"}
          </CardTitle>
          <CardDescription className="text-lg">
            Has completado el cuestionario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-5xl font-bold">{result.score}%</p>
            <Progress value={score} className="h-3" />
            <p className="text-muted-foreground">
              Respondiste correctamente {result.correctCount} de{" "}
              {result.totalQuestions} preguntas.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reintentar Quiz
            </Button>
            <Button onClick={onContinue} disabled={!isSuccess}>
              Continuar con la Siguiente Lección
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
