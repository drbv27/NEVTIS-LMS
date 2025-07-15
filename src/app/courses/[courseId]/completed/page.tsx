//src/app/courses/[courseId]/completed/page.tsx
"use client";

import { useCourseCompletion } from "@/hooks/useCourseCompletion";
import CourseCompletionPage from "@/components/lessons/CourseCompletionPage";

export default function CourseCompletedPage({
  params,
}: {
  params: { courseId: string };
}) {
  // Fetch completion data on the client using a custom hook
  const { data, isLoading, error } = useCourseCompletion(params.courseId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Verifying your achievement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <CourseCompletionPage
      courseId={params.courseId}
      courseName={data?.courseName || ""}
    />
  );
}
