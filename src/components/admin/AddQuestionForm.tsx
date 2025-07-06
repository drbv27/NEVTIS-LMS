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
      // Para opción única, solo una puede ser correcta
      is_correct: i === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      // Limitamos a 5 opciones por pregunta
      setOptions([...options, { option_text: "", is_correct: false }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      // Mantenemos un mínimo de 2 opciones
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
      return toast.error("El texto de la pregunta no puede estar vacío.");
    }
    if (options.some((opt) => !opt.option_text.trim())) {
      return toast.error("Todas las opciones deben tener texto.");
    }
    if (!options.some((opt) => opt.is_correct)) {
      return toast.error("Debes marcar una opción como la correcta.");
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
      <h4 className="text-lg font-semibold mb-4">Añadir Nueva Pregunta</h4>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question-text">Texto de la Pregunta</Label>
          <Input
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Ej: ¿Cuál de estos no es un framework de JavaScript?"
          />
        </div>
        <div className="space-y-2">
          <Label>Opciones de Respuesta (marca la correcta)</Label>
          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox
                  id={`correct-${index}`}
                  checked={opt.is_correct}
                  onCheckedChange={() => handleCorrectChange(index)}
                />
                <Input
                  placeholder={`Opción ${index + 1}`}
                  value={opt.option_text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
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
            Añadir Opción
          </Button>
          <Button onClick={handleSubmit} disabled={isAddingQuestion}>
            {isAddingQuestion && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Guardar Pregunta
          </Button>
        </div>
      </div>
    </div>
  );
}
