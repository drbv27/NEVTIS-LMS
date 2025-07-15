//src/components/lessons/LessonContentPlayer.tsx
"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player/lazy";
import PdfViewer from "./PdfViewer";
import { type Lesson } from "@/lib/types";
import CodeLessonPlayer from "./CodeLessonPlayer";
import QuizPlayer from "./QuizPlayer";

interface LessonContentPlayerProps {
  lesson: Lesson;
  onQuizPassed: () => void;
}

export default function LessonContentPlayer({
  lesson,
  onQuizPassed,
}: LessonContentPlayerProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading player...
      </div>
    );
  }

  const hasContent = lesson.content_url || lesson.content_text;
  // Allow 'code' and 'quiz' types to proceed even without initial content,
  // as their content is managed within their respective components.
  if (
    !hasContent &&
    lesson.lesson_type !== "code" &&
    lesson.lesson_type !== "quiz"
  ) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Content not available for this lesson.
      </div>
    );
  }

  switch (lesson.lesson_type) {
    case "video":
      return (
        <div className="w-full">
          <div className="relative w-full max-w-4xl mx-auto aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <ReactPlayer
              url={lesson.content_url!}
              controls={true}
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
            />
          </div>
        </div>
      );

    case "pdf":
      return <PdfViewer pdfUrl={lesson.content_url!} />;

    case "text":
      if (!lesson.content_text) return <p>Text content not available.</p>;
      return (
        // The 'prose' class from Tailwind Typography will style the rendered HTML.
        <div
          className="prose dark:prose-invert max-w-none p-4"
          dangerouslySetInnerHTML={{ __html: lesson.content_text }}
        />
      );

    case "code":
      // Renders the interactive code editor component
      return <CodeLessonPlayer lesson={lesson} />;

    case "quiz":
      return (
        <QuizPlayer
          lessonId={parseInt(lesson.id)}
          onQuizPassed={onQuizPassed}
        />
      );

    default:
      return (
        <div className="p-6 text-center text-muted-foreground">
          Lesson type &apos;{lesson.lesson_type}&apos; not supported.
        </div>
      );
  }
}
