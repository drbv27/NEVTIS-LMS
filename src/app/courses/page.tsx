// src/app/courses/page.tsx
import CommunityCatalog from "@/components/communities/CommunityCatalog";
import { Suspense } from "react";

export default function CommunitiesPage() {
  return (
    <Suspense>
      <CommunityCatalog />
    </Suspense>
  );
}
