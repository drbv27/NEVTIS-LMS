// src/app/(main)/partner/communities/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PartnerCommunitiesTable from "@/components/partner/PartnerCommunitiesTable";
import { type Community } from "@/lib/types";
import CreateCommunityDialog from "@/components/partner/CreateCommunityDialog";
import EditCommunityDialog from "@/components/partner/EditCommunityDialog";
import DeleteCommunityAlert from "@/components/partner/DeleteCommunityAlert"; // <-- Importamos la alerta

export default function PartnerCommunitiesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [communityToEdit, setCommunityToEdit] = useState<Community | null>(
    null
  );
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(
    null
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Communities</h1>
            <p className="text-muted-foreground">
              Create and manage all the communities you own.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Community
          </Button>
        </div>

        <PartnerCommunitiesTable
          onEdit={(community) => setCommunityToEdit(community)}
          onDelete={(community) => setCommunityToDelete(community)}
        />
      </div>

      <CreateCommunityDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {communityToEdit && (
        <EditCommunityDialog
          community={communityToEdit}
          isOpen={!!communityToEdit}
          onOpenChange={() => setCommunityToEdit(null)}
        />
      )}

      {/* Renderizamos la alerta de borrado cuando una comunidad está seleccionada */}
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
