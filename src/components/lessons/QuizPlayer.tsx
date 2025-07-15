// src/components/lessons/QuizPlayer.tsx
"use client";

import { useState } from "react";
import { useQuizEditor } from "@/hooks/useQuizEditor";
import { useQuizMutations, type QuizResult } from "@/hooks/useQuizMutations";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../ui/label";
import QuizResultDisplay from "./QuizResult";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuizPlayerProps {
  lessonId: number;
  onQuizPassed: () => void;
}

export default function QuizPlayer({
  lessonId,
  onQuizPassed,
}: QuizPlayerProps) {
  const { data: quiz, isLoading, error } = useQuizEditor(lessonId);
  const { submitQuiz, isSubmittingQuiz } = useQuizMutations();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length !== quiz?.quiz_questions.length) {
      return toast.info("Please answer all questions before submitting.");
    }

    submitQuiz(
      {
        quizId: quiz!.id,
        answers,
      },
      {
        onSuccess: (data) => {
          setQuizResult(data);
        },
      }
    );
  };

  const handleRetry = () => {
    setAnswers({});
    setQuizResult(null);
  };

  const handleContinue = () => {
    onQuizPassed();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-center">
        Error loading quiz: {error.message}
      </p>
    );
  }

  if (!quiz) {
    return (
      <p className="text-muted-foreground text-center">
        This quiz is not available yet.
      </p>
    );
  }

  // If we have a result, display the results screen.
  if (quizResult) {
    return (
      <QuizResultDisplay
        result={quizResult}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    );
  }

  // Otherwise, display the quiz questions.
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        <p className="text-muted-foreground mt-2">{quiz.description}</p>
      </div>

      <div className="space-y-8">
        {quiz.quiz_questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle>
                Question {index + 1}: {question.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]}
                onValueChange={(value) =>
                  handleAnswerChange(question.id, value)
                }
              >
                {question.question_options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted/50"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmitQuiz}
          disabled={isSubmittingQuiz}
        >
          {isSubmittingQuiz && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}
