// src/app/community/[communitySlug]/page.tsx
"use client";

import CourseCatalog from "@/components/courses/CourseCatalog";
import { Suspense, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { type Community } from "@/lib/types";
import CommunityHeader from "@/components/communities/CommunityHeader";

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
        .select("*")
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

  // Display a loading state while fetching community data
  if (isLoading) {
    return <p className="text-center py-20">Loading community...</p>;
  }

  // If community is not found after loading, trigger 404
  if (!community) {
    notFound();
  }

  return (
    <div>
      <CommunityHeader community={community} />

      <Suspense
        fallback={<p className="text-center py-10">Loading courses...</p>}
      >
        <CourseCatalog communitySlug={params.communitySlug} />
      </Suspense>
    </div>
  );
}
