// src/app/(main)/feed/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSearchResults } from "@/hooks/useSearchResults";
import SearchResultCard from "@/components/feed/SearchResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX } from "lucide-react";

// Main component that fetches and renders the search results
function SearchResults() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q");

  const { data: results, isLoading, error } = useSearchResults(searchTerm);

  if (isLoading) {
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
        Error searching: {error.message}
      </p>
    );
  }

  if (results && results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <SearchX className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No results found.</p>
        <p className="text-sm">Try using a different search term.</p>
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q") || "";

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Results for:{" "}
        <span className="text-primary">&quot;{searchTerm}&quot;</span>
      </h1>
      {/* Suspense is required here because SearchResults uses the useSearchParams hook. */}
      <Suspense fallback={<p>Loading results...</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
