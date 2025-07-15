// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowRight, BookOpen, Code, Users } from "lucide-react";
import FullPageLoader from "@/components/ui/FullPageLoader";

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

export default function LandingPage() {
  // --- REDIRECTION LOGIC ---
  // If the user is already logged in, redirect to the dashboard.
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // To prevent a "flash" of the landing page, show a loader
  // while checking auth status or during the redirect.
  if (isLoading || user) {
    return <FullPageLoader />;
  }

  // If not loading and no user is found, display the landing page.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-20 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            Your Learning and Collaboration Ecosystem
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join expert communities, access high-quality courses, and take your
            skills to the next level.
          </p>
          <Link href="/courses">
            <Button size="lg">
              Explore Communities <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8 text-primary" />}
                title="Expert-Led Courses"
              >
                Learn with content curated and designed by leading professionals
                in their field.
              </FeatureCard>
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Active Community"
              >
                Connect, collaborate, and solve problems with other passionate
                members and mentors.
              </FeatureCard>
              <FeatureCard
                icon={<Code className="h-8 w-8 text-primary" />}
                title="Applied Learning"
              >
                Test your knowledge with hands-on projects, quizzes, and
                interactive challenges.
              </FeatureCard>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Create your account today and join the community.
          </p>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Create My Account
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
