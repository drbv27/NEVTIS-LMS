// app/(main)/my-courses/page.tsx
import MyCoursesList from "@/components/my-courses/MyCoursesList";

export default function MyCoursesPage() {
  return (
    // En el futuro, podríamos añadir un Suspense si este componente lo necesitara
    <MyCoursesList />
  );
}
