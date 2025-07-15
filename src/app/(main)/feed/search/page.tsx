// src/app/(main)/feed/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSearchResults } from "@/hooks/useSearchResults";
import SearchResultCard from "@/components/feed/SearchResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";

// El componente principal que hace el fetching y renderiza los resultados
function SearchResults() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q");

  const { data: results, isLoading, error } = useSearchResults(searchTerm);

  if (isLoading) {
    // Skeleton loader para la página de resultados
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive">
        Error al buscar: {error.message}
      </p>
    );
  }

  if (results && results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <SearchX className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No se encontraron resultados.</p>
        <p className="text-sm">Intenta con un término de búsqueda diferente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results?.map((result) => (
        <SearchResultCard
          key={`${result.entity_type}-${result.entity_id}`}
          result={result}
        />
      ))}
    </div>
  );
}

// El componente de la página que exportamos
export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q") || "";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Resultados para:{" "}
        <span className="text-primary">&quot;{searchTerm}&quot;</span>
      </h1>
      {/* Suspense es necesario porque el componente de abajo usa useSearchParams */}
      <Suspense fallback={<p>Cargando resultados...</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
