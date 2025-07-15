// src/components/dashboard/TeacherDashboard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, PlusCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

function TeacherDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 3 }).map((_, i) => (
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

export default function TeacherDashboard() {
  const { data: courses, isLoading, error } = useTeacherDashboard();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your courses and review their performance.
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </Link>
      </div>

      {isLoading && <TeacherDashboardSkeleton />}

      {error && (
        <p className="text-destructive">
          Error loading your courses: {error.message}
        </p>
      )}

      {courses && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0 relative h-48 w-full">
                <Image
                  src={course.image_url || "/images/placeholder.png"}
                  alt={`Cover image for ${course.title}`}
                  fill
                  className="object-cover"
                />
                <Badge
                  className="absolute top-2 right-2"
                  variant={
                    course.status === "published" ? "default" : "secondary"
                  }
                >
                  {course.status === "published" ? "Published" : "Draft"}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg line-clamp-2">
                  {course.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Users className="h-4 w-4" />
                  <span>{course.student_count} Students</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    Manage Course
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {courses && courses.length === 0 && !isLoading && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-xl text-muted-foreground">
            You haven&apos;t created any courses yet.
          </p>
          <Link href="/admin/courses/new" className="mt-4 inline-block">
            <Button>Create your first course!</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
