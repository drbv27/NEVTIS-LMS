// src/app/(main)/admin/courses/[courseId]/edit/page.tsx
"use client";

import { useAdminCourse } from "@/hooks/useAdminCourse";
import CourseForm from "@/components/admin/CourseForm";
import ModuleList from "@/components/admin/ModuleList";

export default function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: course, isLoading } = useAdminCourse(params.courseId);

  if (isLoading) return <div>Loading course data...</div>;

  return (
    <div className="space-y-8">
      {/* Form for editing general course details */}
      <CourseForm initialData={course} />

      {/* Component to manage the course's modules and lessons */}
      {course && (
        <ModuleList modules={course.modules} courseId={params.courseId} />
      )}
    </div>
  );
}
