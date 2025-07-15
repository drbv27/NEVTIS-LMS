// src/components/lessons/LessonView.tsx
"use client";

import { useLesson } from "@/hooks/useLesson";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
} from "lucide-react";
import LessonContentPlayer from "./LessonContentPlayer";
import LessonListSidebar from "./LessonListSidebar";
import NotFoundOrErrorPage from "../shared/NotFoundOrErrorPage";

export default function LessonView({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const {
    data: lessonData,
    isLoading,
    error,
    markAsCompleted,
    isCompleting,
  } = useLesson(courseId, lessonId);
  const { isLessonSidebarOpen, toggleLessonSidebar } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error) {
    // Case 1: User is not logged in
    if (error.message.includes("Debes iniciar sesión")) {
      return (
        <NotFoundOrErrorPage
          title="Restricted Access"
          description="To view this lesson, you first need to log in to your account."
          buttonText="Sign In"
          buttonHref={`/login?redirect=/courses/${courseId}/lessons/${lessonId}`}
        />
      );
    }
    // Case 2: User is logged in but not enrolled
    if (error.message.includes("No estás inscrito")) {
      return (
        <NotFoundOrErrorPage
          title="Exclusive Member Content"
          description="It looks like you are not enrolled in this course. Enroll now to access this and all other lessons!"
          buttonText="View Course Page"
          buttonHref={`/courses/${courseId}`}
        />
      );
    }
    // Case 3: Any other generic error
    return <NotFoundOrErrorPage description={error.message} />;
  }

  if (!lessonData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>No data found for this lesson.</p>
      </div>
    );
  }

  const { currentLesson, prevLessonId, nextLessonId, modules, courseTitle } =
    lessonData;

  return (
    <div className="flex h-full">
      <div
        className={`transition-all duration-300 ease-in-out hidden lg:block ${
          isLessonSidebarOpen ? "w-80" : "w-0"
        }`}
      >
        <LessonListSidebar
          modules={modules}
          courseId={courseId}
          currentLessonId={lessonId}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-2 lg:p-4 border-b shrink-0 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              onClick={toggleLessonSidebar}
              variant="outline"
              size="icon"
              className="hidden lg:flex"
              aria-label={
                isLessonSidebarOpen ? "Close sidebar" : "Open sidebar"
              }
            >
              {isLessonSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <div className="flex-1 flex flex-col min-w-0">
              <Link
                href={`/courses/${courseId}`}
                className="hidden sm:block text-xs text-muted-foreground hover:text-primary truncate"
              >
                {courseTitle}
              </Link>
              <h1
                className="text-md sm:text-lg font-bold truncate"
                title={currentLesson.title}
              >
                {currentLesson.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="outline"
              size="icon"
              disabled={!prevLessonId}
            >
              <Link
                href={
                  prevLessonId
                    ? `/courses/${courseId}/lessons/${prevLessonId}`
                    : "#"
                }
                aria-label="Previous lesson"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              onClick={() => markAsCompleted()}
              disabled={isCompleting || currentLesson.is_completed}
              variant={currentLesson.is_completed ? "secondary" : "default"}
            >
              {isCompleting ? (
                "Saving..."
              ) : currentLesson.is_completed ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completed
                </>
              ) : nextLessonId ? (
                "Complete and Continue"
              ) : (
                "Finish Course"
              )}
            </Button>
            <Button asChild size="icon" disabled={!nextLessonId}>
              <Link
                href={
                  nextLessonId
                    ? `/courses/${courseId}/lessons/${nextLessonId}`
                    : "#"
                }
                aria-label="Next lesson"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="p-4 md:p-6">
            <LessonContentPlayer
              lesson={currentLesson}
              onQuizPassed={markAsCompleted}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
