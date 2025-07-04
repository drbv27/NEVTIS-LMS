// src/components/dashboard/AdminDashboard.tsx
"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Library,
  ShieldCheck,
  Component,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

// Un componente reutilizable para nuestras tarjetas de estadísticas
const StatCard = ({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/3 mt-1" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminDashboard();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="mt-2 text-muted-foreground">
          Una vista general del estado de la plataforma.
        </p>
      </div>

      {error && (
        <p className="text-destructive">
          Error al cargar estadísticas: {error.message}
        </p>
      )}

      {/* Sección de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Usuarios"
          value={stats?.total_users ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total de Comunidades"
          value={stats?.total_communities ?? 0}
          icon={<Library className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total de Cursos"
          value={stats?.total_courses ?? 0}
          icon={<Component className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Cursos Publicados"
          value={`${stats?.total_published_courses ?? 0} de ${
            stats?.total_courses ?? 0
          }`}
          icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      {/* Sección de Accesos Directos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Accesos Directos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestionar Usuarios</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/communities">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestionar Comunidades</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin/courses">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestionar Cursos</CardTitle>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
