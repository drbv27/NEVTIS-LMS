// src/app/courses/[courseId]/page.tsx
"use client";

import { useCourseDetails } from "@/hooks/useCourseDetails";
import { useStripeCheckout } from "@/hooks/useStripeCheckout"; // 1. IMPORTAMOS nuestro nuevo hook
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookCopy, DollarSign, Loader2 } from "lucide-react"; // 2. IMPORTAMOS Loader2
import { Module, Lesson } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import NotFoundOrErrorPage from "@/components/shared/NotFoundOrErrorPage";
import LessonTypeIcon from "@/components/lessons/LessonTypeIcon";
import { toast } from "sonner";

// El helper para formatear el precio no cambia
function formatPrice(price: number | null) {
  if (price === null || price === 0) {
    return "Gratis";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { course, isLoading, error, enrollInCourse, isEnrolling } =
    useCourseDetails(params.courseId);

  // 3. USAMOS el hook de Stripe
  const { redirectToCheckout, isRedirecting } = useStripeCheckout();

  const handleEnrollClick = () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${params.courseId}`);
    } else {
      enrollInCourse();
    }
  };

  // 4. ACTUALIZAMOS la función de compra para usar el hook
  const handlePurchaseClick = () => {
    if (!user) {
      toast.info("Por favor, inicia sesión para acceder a una comunidad.");
      router.push(`/login?redirect=/courses/${params.courseId}`);
      return;
    }
    // Verificamos que el curso pertenezca a una comunidad
    if (!course?.community_id) {
      toast.error(
        "Este curso no está asociado a ninguna comunidad y no se puede comprar."
      );
      return;
    }
    // Llamamos a la mutación desde nuestro hook con el communityId
    redirectToCheckout({
      communityId: course.community_id,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">Cargando detalles del curso...</div>
    );
  }

  if (error || !course) {
    return <NotFoundOrErrorPage />;
  }

  let actionButton;
  if (course.isEnrolled) {
    actionButton = (
      <Link
        href={
          course.firstLessonId
            ? `/courses/${course.id}/lessons/${course.firstLessonId}`
            : "#"
        }
      >
        <Button size="lg" className="w-full mt-6 text-lg">
          Ir al Curso / Continuar
        </Button>
      </Link>
    );
  } else if (course.is_free) {
    actionButton = (
      <Button
        size="lg"
        className="w-full mt-6 text-lg"
        onClick={handleEnrollClick}
        disabled={isEnrolling}
      >
        {isEnrolling ? "Inscribiendo..." : "Inscribirse Gratis"}
      </Button>
    );
  } else {
    // 5. ACTUALIZAMOS el botón para mostrar un estado de carga
    actionButton = (
      <Button
        size="lg"
        className="w-full mt-6 text-lg"
        onClick={handlePurchaseClick}
        disabled={isRedirecting} // El botón se deshabilita mientras redirige
      >
        {isRedirecting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <DollarSign className="mr-2 h-5 w-5" />
        )}
        <span>
          {isRedirecting
            ? "Redirigiendo a pago..."
            : `Comprar Curso por ${formatPrice(course.price)}`}
        </span>
      </Button>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg mb-6">
            <Image
              src={course.image_url || "/images/placeholder.png"}
              alt={`Imagen de ${course.title}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-3 text-sm">
            {course.teacherName && (
              <p>
                <strong>Instructor:</strong> {course.teacherName}
              </p>
            )}
            {course.categories && (
              <div className="flex items-center gap-2">
                <strong>Categoría:</strong>{" "}
                <Badge variant="secondary">{course.categories.name}</Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <strong>Precio:</strong>{" "}
              <Badge
                className={
                  course.is_free
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {formatPrice(course.price)}
              </Badge>
            </div>
          </div>
          {actionButton}
        </div>

        <div className="lg:col-span-8 xl:col-span-9 mt-8 lg:mt-0">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">{course.description}</p>
          <div className="mt-10 pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-6">Contenido del Curso</h2>
            <div className="space-y-6">
              {course.modules.map((module: Module) => (
                <div
                  key={module.id}
                  className="p-6 border rounded-lg bg-card shadow-sm"
                >
                  <h3 className="text-xl font-semibold flex items-center mb-3">
                    <BookCopy className="mr-3 h-6 w-6 text-primary" />
                    {module.title}
                  </h3>
                  <ul className="space-y-2">
                    {module.lessons.map((lesson: Lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center p-2.5 rounded-md gap-3"
                      >
                        <LessonTypeIcon
                          type={lesson.lesson_type}
                          className="h-5 w-5 text-secondary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {lesson.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
