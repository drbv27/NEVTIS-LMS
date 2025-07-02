// src/app/courses/page.tsx
import CommunityCatalog from "@/components/communities/CommunityCatalog";
import { Suspense } from "react";

export default function CommunitiesPage() {
  return (
    // Suspense no es estrictamente necesario aquí ya que el hook usa
    // isLoading, pero es una buena práctica mantenerlo.
    <Suspense>
      <CommunityCatalog />
    </Suspense>
  );
}
