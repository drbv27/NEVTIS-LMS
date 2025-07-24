// src/components/admin/CreateLessonForm.tsx
"use client";

import { useState } from "react";
import { useCourseMutations } from "@/hooks/useCourseMutations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { PlusCircle } from "lucide-react";
import { Lesson } from "@/lib/types";
import TiptapEditor from "../shared/TiptapEditor";
import CodeEditor from "../shared/CodeEditor";
import { toast } from "sonner";

interface CreateLessonFormProps {
  moduleId: string;
  courseId: string;
}

export default function CreateLessonForm({
  moduleId,
  courseId,
}: CreateLessonFormProps) {
  const { createLesson, isCreatingLesson } = useCourseMutations();

  // General states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessonType, setLessonType] = useState<Lesson["lesson_type"] | "">("");

  // Content-specific states
  const [file, setFile] = useState<File | null>(null);
  const [contentText, setContentText] = useState("");

  // States for 'code' lesson type
  const [setupCode, setSetupCode] = useState(
    "function myFunction() {\n  // Your code here\n}"
  );
  const [solutionCode, setSolutionCode] = useState(
    "function myFunction() {\n  return true;\n}"
  );
  const [testCode, setTestCode] = useState(
    "const assert = require('assert');\nassert.strictEqual(myFunction(), true, 'The result must be true');"
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLessonType("");
    setFile(null);
    setContentText("");
    // Also clear file and code inputs
    const fileInput = document.getElementById(
      `file-input-${moduleId}`
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setSetupCode("function myFunction() {\n  // Your code here\n}");
    setSolutionCode("function myFunction() {\n  return true;\n}");
    setTestCode(
      "const assert = require('assert');\nassert.strictEqual(myFunction(), true, 'The result must be true');"
    );
  };

  const handleAddLesson = () => {
    if (!title || !lessonType) return;

    if ((lessonType === "video" || lessonType === "pdf") && !file) {
      return toast.error("Please select a file to upload.");
    }
    if (lessonType === "text" && !contentText.trim()) {
      return toast.error("Text content cannot be empty.");
    }

    createLesson(
      {
        title,
        description,
        moduleId,
        courseId,
        lessonType,
        file,
        contentText,
        setup_code: lessonType === "code" ? setupCode : null,
        solution_code: lessonType === "code" ? solutionCode : null,
        test_code: lessonType === "code" ? testCode : null,
      },
      { onSuccess: resetForm }
    );
  };

  return (
    <div className="p-4 bg-muted/50 border-t mt-4 space-y-4">
      <h5 className="text-sm font-semibold">Add New Lesson</h5>
      <div className="space-y-2">
        <Label htmlFor={`title-${moduleId}`}>Lesson Title</Label>
        <Input
          id={`title-${moduleId}`}
          placeholder="e.g., What is a variable?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreatingLesson}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`desc-${moduleId}`}>Short Description</Label>
        <Textarea
          id={`desc-${moduleId}`}
          placeholder="A brief introduction to the lesson..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isCreatingLesson}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Content Type</Label>
        <Select
          onValueChange={(value) =>
            setLessonType(value as Lesson["lesson_type"])
          }
          value={lessonType}
          disabled={isCreatingLesson}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">📹 Video</SelectItem>
            <SelectItem value="pdf">📄 PDF</SelectItem>
            <SelectItem value="text">📝 Rich Text</SelectItem>
            <SelectItem value="quiz">🧠 Quiz (coming soon)</SelectItem>
            <SelectItem value="code">💻 Code</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {lessonType === "text" && (
        <div className="space-y-2">
          <Label>Text Content</Label>
          <TiptapEditor content={contentText} onChange={setContentText} />
        </div>
      )}
      {(lessonType === "video" || lessonType === "pdf") && (
        <div className="space-y-2">
          <Label>Upload File</Label>
          <Input
            id={`file-input-${moduleId}`}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isCreatingLesson}
            accept={lessonType === "video" ? "video/*" : "application/pdf"}
          />
        </div>
      )}
      {lessonType === "code" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Instructions (using the rich text editor)</Label>
            <TiptapEditor content={contentText} onChange={setContentText} />
          </div>
          <div className="space-y-2">
            <Label>Setup Code</Label>
            <CodeEditor value={setupCode} onChange={setSetupCode} />
          </div>
          <div className="space-y-2">
            <Label>Solution Code</Label>
            <CodeEditor value={solutionCode} onChange={setSolutionCode} />
          </div>
          <div className="space-y-2">
            <Label>Test Code</Label>
            <CodeEditor value={testCode} onChange={setTestCode} />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleAddLesson}
          size="sm"
          disabled={isCreatingLesson || !title || !lessonType}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isCreatingLesson ? "Adding..." : "Add Lesson"}
        </Button>
      </div>
    </div>
  );
}
