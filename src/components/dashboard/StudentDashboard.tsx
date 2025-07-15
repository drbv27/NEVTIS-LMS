// src/components/dashboard/StudentDashboard.tsx
"use client";

import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import CourseProgressCard from "./CourseProgressCard";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { Button } from "../ui/button";

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[180px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const { data: courses, isLoading, error } = useStudentDashboard();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="mt-2 text-muted-foreground">
          Continue your learning journey where you left off.
        </p>
      </div>

      {isLoading && <DashboardSkeleton />}

      {error && (
        <p className="text-destructive">
          Error loading your courses: {error.message}
        </p>
      )}

      {courses && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseProgressCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {courses && courses.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-xl text-muted-foreground">
            You haven&apos;t joined any communities with courses yet.
          </p>
          <Link href="/courses" className="mt-4 inline-block">
            <Button variant="outline">Explore Communities</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
