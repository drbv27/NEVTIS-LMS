// src/app/community/[communitySlug]/page.tsx
"use client";

import CourseCatalog from "@/components/courses/CourseCatalog";
import { Suspense, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Community } from "@/lib/types"; // Importamos el tipo Community
import CommunityHeader from "@/components/communities/CommunityHeader"; // Importaremos nuestro nuevo componente

export default function CommunityCoursesPage({
  params,
}: {
  params: { communitySlug: string };
}) {
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getCommunityData() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("communities")
        .select("*") // Obtenemos todos los datos de la comunidad
        .eq("slug", params.communitySlug)
        .single();

      if (error || !data) {
        setError(true);
      } else {
        setCommunity(data);
      }
      setIsLoading(false);
    }

    getCommunityData();
  }, [params.communitySlug]);

  if (error) {
    notFound();
  }

  // Mostramos un esqueleto de carga general mientras se obtienen los datos
  if (isLoading) {
    return <p className="text-center py-20">Cargando comunidad...</p>;
  }

  // Si la comunidad no se encuentra después de cargar, mostramos 404
  if (!community) {
    notFound();
  }

  return (
    <div>
      {/* Componente que mostrará el título y el botón de compra */}
      <CommunityHeader community={community} />

      <Suspense
        fallback={<p className="text-center py-10">Cargando cursos...</p>}
      >
        <CourseCatalog communitySlug={params.communitySlug} />
      </Suspense>
    </div>
  );
}
