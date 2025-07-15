// src/components/admin/EditQuestionDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuizMutations } from "@/hooks/useQuizMutations";
import { type QuizQuestion } from "@/hooks/useQuizEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditQuestionDialogProps {
  question: QuizQuestion;
  lessonId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditQuestionDialog({
  question,
  lessonId,
  isOpen,
  onOpenChange,
}: EditQuestionDialogProps) {
  const { updateQuestion, isUpdatingQuestion } = useQuizMutations();

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<
    (QuizQuestion["question_options"][0] & { isNew?: boolean })[]
  >([]);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setOptions(
        question.question_options.map((opt) => ({ ...opt, isNew: false }))
      );
    }
  }, [question, isOpen]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].option_text = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([
        ...options,
        {
          id: `new-${Date.now()}`,
          option_text: "",
          is_correct: false,
          isNew: true,
        },
      ]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleUpdate = () => {
    if (!questionText.trim()) {
      return toast.error("The question text cannot be empty.");
    }
    if (options.some((opt) => !opt.option_text.trim())) {
      return toast.error("All options must have text.");
    }
    if (!options.some((opt) => opt.is_correct)) {
      return toast.error("You must mark one option as correct.");
    }

    const finalOptions = options.map((opt) => ({
      id: opt.isNew ? undefined : opt.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
    }));

    updateQuestion(
      {
        lessonId,
        questionId: question.id,
        questionText,
        options: finalOptions,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Modify the question text and its options.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="edit-question-text">Question Text</Label>
            <Input
              id="edit-question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Answer Options</Label>
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`edit-correct-${index}`}
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
          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={options.length >= 5}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isUpdatingQuestion}>
            {isUpdatingQuestion && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
