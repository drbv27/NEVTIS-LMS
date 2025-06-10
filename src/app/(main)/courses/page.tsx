// app/(main)/courses/page.tsx
import CourseCatalog from "@/components/courses/CourseCatalog";
import { Suspense } from "react";

// El componente de página en sí es muy simple
export default function CoursesPage() {
  return (
    // Suspense es necesario porque CourseCatalog usa useSearchParams
    <Suspense
      fallback={<p className="text-center py-10">Cargando filtros...</p>}
    >
      <CourseCatalog />
    </Suspense>
  );
}
