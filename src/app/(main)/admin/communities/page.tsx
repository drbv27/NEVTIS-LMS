// src/app/(main)/admin/communities/page.tsx
"use client"; // 1. CONVERTIMOS LA PÁGINA EN UN COMPONENTE DE CLIENTE

import { useState } from "react"; // 2. IMPORTAMOS useState
import CommunitiesTable from "@/components/admin/CommunitiesTable";
import { Button } from "@/components/ui/button"; // 3. IMPORTAMOS Button
import { PlusCircle } from "lucide-react"; // 4. IMPORTAMOS un ícono
import CreateCommunityDialog from "@/components/admin/CreateCommunityDialog"; // 5. IMPORTAMOS nuestro nuevo diálogo

export default function AdminCommunitiesPage() {
  // 6. AÑADIMOS ESTADO PARA CONTROLAR LA VISIBILIDAD DEL DIÁLOGO
  const [isCreateCommunityDialogOpen, setIsCreateCommunityDialogOpen] =
    useState(false);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Comunidades</h1>
            <p className="text-muted-foreground">
              Crea, edita y administra todas las comunidades de la plataforma.
            </p>
          </div>
          {/* 7. AÑADIMOS EL BOTÓN PARA ABRIR EL DIÁLOGO */}
          <Button onClick={() => setIsCreateCommunityDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Comunidad
          </Button>
        </div>
        <div>
          <CommunitiesTable />
        </div>
      </div>

      {/* 8. RENDERIZAMOS EL DIÁLOGO Y LE PASAMOS EL ESTADO */}
      <CreateCommunityDialog
        isOpen={isCreateCommunityDialogOpen}
        onOpenChange={setIsCreateCommunityDialogOpen}
      />
    </>
  );
}
