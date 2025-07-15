// src/components/courses/CourseCatalog.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseCatalogProps {
  communitySlug: string;
}

export default function CourseCatalog({ communitySlug }: CourseCatalogProps) {
  const searchParams = useSearchParams();
  const selectedCategorySlug = searchParams.get("category");

  // Pass both slugs to the hook
  const { courses, categories, isLoading, error } = useCourses(
    selectedCategorySlug,
    communitySlug
  );

  if (isLoading) {
    return <p className="text-center py-10">Loading courses...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-10">
        Error loading: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Category Filters (links now preserve the community slug) */}
      <div className="mb-10 flex flex-wrap justify-center items-center gap-3">
        <Link href={`/community/${communitySlug}`}>
          <Button
            variant={!selectedCategorySlug ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            All
          </Button>
        </Link>
        {categories.map((category) => (
          <Link
            href={`/community/${communitySlug}?category=${category.slug}`}
            key={category.id}
          >
            <Button
              variant={
                selectedCategorySlug === category.slug ? "default" : "outline"
              }
              size="sm"
              className="rounded-full"
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={course.image_url || "/images/placeholder.png"}
                  alt={`Image for ${course.title}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw, 33vw"
                />
              </div>
              <CardHeader>
                {course.categories && (
                  <Badge variant="secondary" className="w-fit">
                    {course.categories.name}
                  </Badge>
                )}
                <CardTitle className="mt-2 text-lg font-semibold line-clamp-2">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {course.description || "No description available."}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/courses/${course.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">
            No courses found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
