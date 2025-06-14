// src/components/my-courses/MyCoursesList.tsx
"use client";

import { useMyCourses } from "@/hooks/useMyCourses";
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

export default function MyCoursesList() {
  // Usamos nuestro nuevo y específico hook
  const { data: courses, isLoading, error } = useMyCourses();

  if (isLoading) {
    return <p className="text-center py-10">Cargando tus cursos...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-10">
        Error al cargar tus cursos: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Mis Cursos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Continúa tu aprendizaje donde lo dejaste.
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={course.image_url || "/images/placeholder.png"}
                  alt={`Imagen de ${course.title}`}
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
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description || "No hay descripción disponible."}
                </p>
              </CardContent>
              <CardFooter>
                {/* El botón ahora lleva al curso directamente */}
                <Link href={`/courses/${course.id}`} className="w-full">
                  <Button className="w-full">Ir al Curso</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-xl text-muted-foreground">
            Aún no te has inscrito en ningún curso.
          </p>
          <Link href="/courses" className="mt-4 inline-block">
            <Button variant="outline">Explorar Cursos</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
