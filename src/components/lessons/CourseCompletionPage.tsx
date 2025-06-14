//src/components/lessons/CourseCompletionPage.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Award, Book, Home, Star } from "lucide-react";

interface CourseCompletionPageProps {
  courseId: string;
  courseName: string;
}

export default function CourseCompletionPage({
  courseId,
  courseName,
}: CourseCompletionPageProps) {
  // Estado para las dimensiones de la ventana, necesario para el confeti
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Solo ejecutamos esto en el cliente
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Establecer el tamaño inicial y escuchar cambios
    handleResize();
    window.addEventListener("resize", handleResize);

    // Limpiar el listener al desmontar el componente
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={400}
        tweenDuration={10000}
      />
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-2xl text-center shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
          <CardHeader>
            <Award className="mx-auto h-16 w-16 text-yellow-500" />
            <CardTitle className="text-3xl sm:text-4xl font-bold mt-4">
              ¡Felicidades!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Has completado exitosamente el curso: <br />
              <span className="font-semibold text-primary">{courseName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              ¡Gran trabajo! Has dado un paso importante en tu camino de
              aprendizaje. ¿Qué te gustaría hacer ahora?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild variant="outline">
                <Link href="/my-courses">
                  <Book className="mr-2 h-4 w-4" /> Ver todos mis cursos
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/courses">
                  <Award className="mr-2 h-4 w-4" /> Explorar más cursos
                </Link>
              </Button>
              {/* Estos son placeholders para futuras funcionalidades */}
              <Button disabled variant="secondary">
                <Star className="mr-2 h-4 w-4" /> Dejar una reseña
              </Button>
              <Button disabled variant="secondary">
                <Home className="mr-2 h-4 w-4" /> Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
