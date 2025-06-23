// src/hooks/useSearchResults.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Definimos un tipo para la forma que tendrán nuestros resultados de búsqueda unificados
export interface SearchResult {
  entity_id: string;
  entity_type: "profile" | "hashtag" | "post";
  title: string;
  description: string | null;
  image_url: string | null;
}

// La función que llama a nuestra RPC de Supabase
async function fetchSearchResults(searchTerm: string): Promise<SearchResult[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("global_search", {
    search_term: searchTerm,
  });

  if (error) {
    console.error("Error fetching search results:", error);
    throw new Error("No se pudieron obtener los resultados de la búsqueda.");
  }

  return data as SearchResult[];
}

// El hook personalizado que envuelve la lógica
export function useSearchResults(searchTerm: string | null) {
  return useQuery<SearchResult[], Error>({
    // La queryKey incluye el término de búsqueda para cachear cada búsqueda por separado
    queryKey: ["search-results", searchTerm],
    queryFn: () => fetchSearchResults(searchTerm!),
    // La query solo se ejecutará si hay un término de búsqueda válido (no nulo o vacío)
    enabled: !!searchTerm,
  });
}
