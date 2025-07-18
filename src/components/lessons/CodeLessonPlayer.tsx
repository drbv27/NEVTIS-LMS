// src/components/lessons/CodeLessonPlayer.tsx
"use client";

import { useState, useEffect } from "react";
import { type Lesson } from "@/lib/types";
import CodeEditor from "@/components/shared/CodeEditor";
import { Button } from "@/components/ui/button";
import {
  Play,
  RotateCcw,
  Terminal,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { useCodeRunner } from "@/hooks/useCodeRunner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CodeLessonPlayerProps {
  lesson: Lesson;
}

export default function CodeLessonPlayer({ lesson }: CodeLessonPlayerProps) {
  const [studentCode, setStudentCode] = useState(lesson.setup_code || "");
  const { runCode, isLoading, result, error } = useCodeRunner();

  useEffect(() => {
    setStudentCode(lesson.setup_code || "");
  }, [lesson.id, lesson.setup_code]);

  const handleRunCode = () => {
    runCode({
      studentCode,
      testCode: lesson.test_code || "",
    });
  };

  const handleResetCode = () => {
    setStudentCode(lesson.setup_code || "");
  };

  let outputContent: React.ReactNode = (
    <p className="text-sm text-gray-400">Run the tests to see the output.</p>
  );
  if (isLoading) {
    outputContent = <p className="text-sm text-blue-400">Running...</p>;
  } else if (result) {
    outputContent = (
      <div
        className={cn(
          "text-sm",
          result.success ? "text-green-400" : "text-red-400"
        )}
      >
        {result.success ? (
          <CheckCircle className="inline-block mr-2 h-4 w-4" />
        ) : (
          <XCircle className="inline-block mr-2 h-4 w-4" />
        )}
        <pre className="whitespace-pre-wrap font-mono">
          {result.output || result.error}
        </pre>
      </div>
    );
  } else if (error) {
    outputContent = (
      <div className="text-sm text-red-400">
        <XCircle className="inline-block mr-2 h-4 w-4" />
        <pre className="whitespace-pre-wrap font-mono">{error.message}</pre>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
        <div className="p-4 border-b shrink-0">
          <h3 className="text-lg font-semibold">Instructions</h3>
        </div>
        <div
          className="prose dark:prose-invert max-w-none p-4 overflow-y-auto"
          dangerouslySetInnerHTML={{
            __html:
              lesson.content_text ||
              "No instructions provided for this lesson.",
          }}
        />
      </div>

      <div className="flex flex-col gap-4 min-h-0">
        <div className="flex flex-col rounded-lg border bg-card overflow-hidden flex-grow">
          <div className="flex items-center justify-between p-2 border-b shrink-0">
            <h3 className="text-lg font-semibold pl-2">Your Solution</h3>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Solution
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Solution Code</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 rounded-md overflow-hidden">
                    <CodeEditor
                      value={
                        lesson.solution_code || "// No solution available."
                      }
                      onChange={() => {}} // Make the solution code non-editable
                      height="400px"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCode}
                title="Reset Code"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button size="sm" onClick={handleRunCode} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Run Tests
              </Button>
            </div>
          </div>
          <div className="flex-grow relative">
            <CodeEditor
              key={lesson.id}
              value={studentCode}
              onChange={setStudentCode}
              height="100%"
            />
          </div>
        </div>

        <div className="flex flex-col rounded-lg border bg-gray-900 text-white font-mono overflow-hidden h-2/5">
          <div className="flex items-center gap-2 p-3 border-b border-gray-700 shrink-0">
            <Terminal className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-300">
              Output Console
            </h3>
          </div>
          <div className="p-4 overflow-y-auto">{outputContent}</div>
        </div>
      </div>
    </div>
  );
}
