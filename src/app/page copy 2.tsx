// src/app/page.tsx
"use client"; // <-- LA REGLA DE ORO

import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowRight, BookOpen, Code, Users } from "lucide-react";

// Componente para una tarjeta de característica
const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card p-6 rounded-lg shadow-sm">
    <div className="flex items-center gap-4 mb-3">
      {icon}
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

// Es un componente de cliente simple. No hay 'async'. No hay data fetching.
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            Tu Ecosistema de Aprendizaje y Colaboración
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Únete a comunidades de expertos, accede a cursos de alta calidad y
            lleva tus habilidades al siguiente nivel.
          </p>
          <Link href="/courses">
            <Button size="lg">
              Explorar Comunidades <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-primary" />}
                title="Cursos de Expertos"
              >
                Aprende con contenido curado y diseñado por profesionales
                líderes en su campo.
              </FeatureCard>
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Comunidad Activa"
              >
                Conecta, colabora y resuelve dudas con otros miembros y mentores
                apasionados.
              </FeatureCard>
              <FeatureCard
                icon={<Code className="h-8 w-8 text-primary" />}
                title="Aprendizaje Aplicado"
              >
                Pon a prueba tus conocimientos con proyectos prácticos, quizzes
                y retos interactivos.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-muted-foreground mb-8">
            Crea tu cuenta hoy mismo y únete a la comunidad.
          </p>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Crear mi Cuenta
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
