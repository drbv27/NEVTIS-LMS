// src/components/admin/CommunitiesTable.tsx
"use client";

import { useState } from "react";
import { useAdminCommunities } from "@/hooks/useAdminCommunities";
import { type Community } from "@/lib/types";
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
import { MoreHorizontal, Library, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import EditCommunityDialog from "./EditCommunityDialog";
import DeleteCommunityAlert from "./DeleteCommunityAlert"; // 1. IMPORTAMOS la nueva alerta

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

  const [communityToEdit, setCommunityToEdit] = useState<Community | null>(
    null
  );
  // 2. AÑADIMOS ESTADO PARA CONTROLAR QUÉ COMUNIDAD SE VA A ELIMINAR
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(
    null
  );

  if (isLoading) {
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
    <>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setCommunityToEdit(community)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* 3. AÑADIMOS LA OPCIÓN DE ELIMINAR */}
                      <DropdownMenuItem
                        onClick={() => setCommunityToDelete(community)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* El diálogo de edición no cambia */}
      {communityToEdit && (
        <EditCommunityDialog
          community={communityToEdit}
          isOpen={!!communityToEdit}
          onOpenChange={() => setCommunityToEdit(null)}
        />
      )}

      {/* 4. RENDERIZAMOS LA ALERTA DE FORMA CONDICIONAL */}
      {communityToDelete && (
        <DeleteCommunityAlert
          community={communityToDelete}
          isOpen={!!communityToDelete}
          onOpenChange={() => setCommunityToDelete(null)}
        />
      )}
    </>
  );
}
