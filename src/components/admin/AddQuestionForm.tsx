// src/components/admin/AddQuestionForm.tsx
"use client";

import { useState } from "react";
import { useQuizMutations } from "@/hooks/useQuizMutations";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { X, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddQuestionFormProps {
  quizId: string;
  lessonId: number;
}

export default function AddQuestionForm({
  quizId,
  lessonId,
}: AddQuestionFormProps) {
  const { addQuestion, isAddingQuestion } = useQuizMutations();
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].option_text = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      // For single-choice questions, only one option can be correct.
      is_correct: i === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    // Limit to a maximum of 5 options per question.
    if (options.length < 5) {
      setOptions([...options, { option_text: "", is_correct: false }]);
    }
  };

  const removeOption = (index: number) => {
    // Maintain a minimum of 2 options.
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const resetForm = () => {
    setQuestionText("");
    setOptions([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
  };

  const handleSubmit = () => {
    if (!questionText.trim()) {
      return toast.error("The question text cannot be empty.");
    }
    if (options.some((opt) => !opt.option_text.trim())) {
      return toast.error("All options must have text.");
    }
    if (!options.some((opt) => opt.is_correct)) {
      return toast.error("You must mark one option as correct.");
    }

    addQuestion(
      {
        quizId,
        lessonId,
        questionText,
        questionType: "multiple_choice_single",
        options,
      },
      {
        onSuccess: resetForm,
      }
    );
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h4 className="text-lg font-semibold mb-4">Add New Question</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-text">Question Text</Label>
          <Input
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g., Which of these is not a JavaScript framework?"
          />
        </div>
        <div className="space-y-2">
          <Label>Answer Options (check the correct one)</Label>
          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox
                  id={`correct-${index}`}
                  checked={opt.is_correct}
                  onCheckedChange={() => handleCorrectChange(index)}
                />
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={opt.option_text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  aria-label="Remove option"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={addOption}
            disabled={options.length >= 5}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Option
          </Button>
          <Button onClick={handleSubmit} disabled={isAddingQuestion}>
            {isAddingQuestion && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Question
          </Button>
        </div>
      </div>
    </div>
  );
}
