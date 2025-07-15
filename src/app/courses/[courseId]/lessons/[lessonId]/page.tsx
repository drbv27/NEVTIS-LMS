// src/app/courses/[courseId]/lessons/[lessonId]/page.tsx
import LessonView from "@/components/lessons/LessonView";
import { Suspense } from "react";

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  // Note: This page uses a distinct layout where the main Navbar/Sidebar are hidden.
  // The LessonView component is designed to occupy the full screen for an
  // immersive learning experience.
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <p>Loading lesson...</p>
        </div>
      }
    >
      <LessonView courseId={params.courseId} lessonId={params.lessonId} />
    </Suspense>
  );
}
