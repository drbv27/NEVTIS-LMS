// src/app/community/[communitySlug]/page.tsx
"use client"; // <-- VOLVEMOS A UN COMPONENTE DE CLIENTE

import CourseCatalog from "@/components/courses/CourseCatalog";
import { Suspense, useEffect, useState } from "react";
import { notFound } from "next/navigation";
// Usamos el cliente correcto, el que existe en nuestro proyecto
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function CommunityCoursesPage({
  params,
}: {
  params: { communitySlug: string };
}) {
  // Usamos estados locales para manejar el nombre y la carga
  const [communityName, setCommunityName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Función asíncrona para obtener los datos desde el cliente
    async function getCommunityName() {
      const supabase = createSupabaseBrowserClient();
      const { data: community, error } = await supabase
        .from("communities")
        .select("name")
        .eq("slug", params.communitySlug)
        .single();

      if (error || !community) {
        setError(true);
      } else {
        setCommunityName(community.name);
      }
      setIsLoading(false);
    }

    getCommunityName();
  }, [params.communitySlug]); // Se ejecuta cada vez que el slug cambia

  // Si hay un error (ej. la comunidad no existe), mostramos 404
  if (error) {
    notFound();
  }

  return (
    <div>
      <div className="text-center my-12">
        {/* Mostramos un esqueleto mientras carga el nombre */}
        {isLoading ? (
          <div className="h-12 w-1/2 bg-muted rounded-md animate-pulse mx-auto"></div>
        ) : (
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Cursos de la Comunidad: {communityName}
          </h1>
        )}
        <p className="mt-4 text-lg text-muted-foreground">
          Explora todos los cursos disponibles en esta comunidad.
        </p>
      </div>
      <Suspense fallback={<p className="text-center py-10">Cargando...</p>}>
        <CourseCatalog communitySlug={params.communitySlug} />
      </Suspense>
    </div>
  );
}
