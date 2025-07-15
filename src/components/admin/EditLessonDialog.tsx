// src/components/admin/EditLessonDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useCourseMutations } from "@/hooks/useCourseMutations";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type Lesson } from "@/lib/types";
import TiptapEditor from "../shared/TiptapEditor";
import Link from "next/link";
import CodeEditor from "../shared/CodeEditor";
import QuizEditor from "./QuizEditor";

interface EditLessonDialogProps {
  lesson: Lesson;
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditLessonDialog({
  lesson,
  courseId,
  isOpen,
  onOpenChange,
}: EditLessonDialogProps) {
  // General states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Content-specific states
  const [file, setFile] = useState<File | null>(null);
  const [contentText, setContentText] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [testCode, setTestCode] = useState("");

  const { updateLesson, isUpdatingLesson } = useCourseMutations();

  // Sync form state whenever the dialog is opened with a new lesson
  useEffect(() => {
    if (isOpen && lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || "");
      setContentText(lesson.content_text || "");
      setSetupCode(lesson.setup_code || "");
      setSolutionCode(lesson.solution_code || "");
      setTestCode(lesson.test_code || "");
      setFile(null); // Reset file input on open
    }
  }, [isOpen, lesson]);

  const handleUpdate = () => {
    // TODO: This mutation will need to be updated to save quiz data
    updateLesson(
      {
        lessonId: lesson.id,
        courseId,
        title,
        description,
        file,
        contentText,
        setup_code: setupCode,
        solution_code: solutionCode,
        test_code: testCode,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  // Renders the appropriate content editor based on the lesson type
  const renderContentEditor = () => {
    switch (lesson.lesson_type) {
      case "quiz":
        return <QuizEditor lessonId={parseInt(lesson.id)} />;

      case "code":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Instructions</Label>
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
        );

      case "text":
        return <TiptapEditor content={contentText} onChange={setContentText} />;

      case "video":
      case "pdf":
        return (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Current content:
            </p>
            {lesson.content_url ? (
              <Link
                href={lesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all block mb-4"
              >
                {lesson.content_url}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-4">
                No file content assigned.
              </p>
            )}
            <Label htmlFor="edit-file" className="text-sm font-medium">
              Replace file
            </Label>
            <Input
              id="edit-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept={
                lesson.lesson_type === "video" ? "video/*" : "application/pdf"
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select a file only if you want to replace the current one.
            </p>
          </div>
        );
      default:
        return <p>Lesson type not supported for editing.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Lesson: {lesson.title}</DialogTitle>
          <DialogDescription>
            Modify the details and content of this lesson.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label className="font-semibold">
              Lesson Content ({lesson.lesson_type})
            </Label>
            {renderContentEditor()}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isUpdatingLesson}>
            {isUpdatingLesson ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
