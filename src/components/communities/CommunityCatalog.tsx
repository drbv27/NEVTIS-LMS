// src/components/communities/CommunityCatalog.tsx
"use client";

import { usePublicCommunities } from "@/hooks/usePublicCommunities";
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
import { Skeleton } from "@/components/ui/skeleton";

// Un componente de esqueleto para mejorar la UX de carga
function CommunityCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function CommunityCatalog() {
  // Usamos el hook que ya creamos para obtener las comunidades
  const { data: communities, isLoading, error } = usePublicCommunities();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <CommunityCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-10">
        Error al cargar las comunidades: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Explora Nuestras Comunidades
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Únete a una comunidad para acceder a cursos exclusivos, conectar con
          otros profesionales y llevar tus habilidades al siguiente nivel.
        </p>
      </div>

      {communities && communities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {communities.map((community) => (
            <Card
              key={community.id}
              className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={community.image_url || "/images/placeholder.png"}
                  alt={`Imagen de ${community.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="mt-2 text-lg font-semibold line-clamp-2">
                  {community.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {community.description || "Explora esta comunidad."}
                </p>
              </CardContent>
              <CardFooter>
                {/* A futuro, este enlace llevará a /community/[slug] */}
                <Link href="#" className="w-full">
                  <Button className="w-full">Ver Comunidad</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">
            No hay comunidades disponibles en este momento.
          </p>
        </div>
      )}
    </div>
  );
}
