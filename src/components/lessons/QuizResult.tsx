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
  // Define 70 as the passing score
  const isSuccess = score >= 70;

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
            {isSuccess ? "Congratulations!" : "Keep Trying"}
          </CardTitle>
          <CardDescription className="text-lg">
            You have completed the quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-5xl font-bold">{result.score}%</p>
            <Progress value={score} className="h-3" />
            <p className="text-muted-foreground">
              You answered {result.correctCount} out of {result.totalQuestions}{" "}
              questions correctly.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Quiz
            </Button>
            <Button onClick={onContinue} disabled={!isSuccess}>
              Continue to Next Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
