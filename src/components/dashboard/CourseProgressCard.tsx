// src/components/dashboard/CourseProgressCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { type DashboardCourse } from "@/hooks/useStudentDashboard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface CourseProgressCardProps {
  course: DashboardCourse;
}

export default function CourseProgressCard({
  course,
}: CourseProgressCardProps) {
  // Calculate the progress percentage
  const progressPercentage =
    course.total_lessons > 0
      ? (course.completed_lessons / course.total_lessons) * 100
      : 0;

  // Determine the link for the 'Continue' button
  const continueLink = course.first_lesson_id
    ? `/courses/${course.id}/lessons/${course.first_lesson_id}`
    : `/community/${course.community_slug}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="relative w-full aspect-video">
        <Image
          src={course.image_url || "/images/placeholder.png"}
          alt={`Cover image for ${course.title}`}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="flex-grow p-4">
        <h3 className="mb-2 font-semibold line-clamp-2">{course.title}</h3>
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progressPercentage)}% complete (
            {course.completed_lessons} of {course.total_lessons} lessons)
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={continueLink} className="w-full">
          <Button className="w-full">Continue Learning</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
