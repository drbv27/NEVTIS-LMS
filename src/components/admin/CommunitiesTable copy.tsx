// src/components/admin/CommunitiesTable.tsx
"use client";

import { useAdminCommunities } from "@/hooks/useAdminCommunities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Library } from "lucide-react";
import { Button } from "../ui/button";

// Helper para formatear fechas
function formatDate(dateString: string | undefined) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CommunitiesTable() {
  const { data: communities, isLoading, error } = useAdminCommunities();

  if (isLoading) {
    // Skeleton loader para la tabla
    return (
      <div className="border rounded-lg p-4">
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive">
        Error al cargar comunidades: {error.message}
      </p>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>ID de Precio (Stripe)</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communities?.map((community) => (
            <TableRow key={community.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={community.image_url || ""} />
                    <AvatarFallback>
                      <Library className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{community.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm text-muted-foreground">
                  {community.slug}
                </code>
              </TableCell>
              <TableCell>
                <code className="text-sm text-muted-foreground">
                  {community.stripe_price_id || "N/A"}
                </code>
              </TableCell>
              <TableCell className="text-right">
                {/* Aquí irán los botones de editar/eliminar en el futuro */}
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
