// src/components/courses/CourseCatalog.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useCourses } from "@/hooks/useCourses"; // <-- Nuestro hook
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
import { Filter } from "lucide-react";

export default function CourseCatalog() {
  const searchParams = useSearchParams();
  const selectedCategorySlug = searchParams.get("category");

  // Usamos el hook para obtener todos los datos y estados
  const { courses, categories, isLoading, error } =
    useCourses(selectedCategorySlug);

  // El resto del componente es casi idéntico al que tenías,
  // pero ahora es mucho más "tonto", solo se dedica a renderizar.

  if (isLoading) {
    return <p className="text-center py-10">Cargando...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-10">
        Error al cargar: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Nuestro Catálogo de Cursos
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Encuentra la formación que necesitas para impulsar tu carrera.
        </p>
      </div>

      {/* --- Filtros de Categoría --- */}
      <div className="mb-10 flex flex-wrap justify-center items-center gap-3">
        <Link href="/courses">
          <Button
            variant={!selectedCategorySlug ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            Todos
          </Button>
        </Link>
        {categories.map((category) => (
          <Link href={`/courses?category=${category.slug}`} key={category.id}>
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

      {/* --- Grid de Cursos --- */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={course.image_url || "/images/placeholder.png"} // Ten un placeholder en public/images
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
                <p className="text-sm text-gray-600 line-clamp-3">
                  {course.description || "No hay descripción disponible."}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/courses/${course.id}`} className="w-full">
                  <Button className="w-full">Ver Detalles</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">
            No se encontraron cursos en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}
