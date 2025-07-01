// src/components/admin/EditCommunityDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useAdminCommunityMutations } from "@/hooks/useAdminCommunityMutations";
import { type Community } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditCommunityDialogProps {
  community: Community;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCommunityDialog({
  community,
  isOpen,
  onOpenChange,
}: EditCommunityDialogProps) {
  const { updateCommunity, isUpdatingCommunity } = useAdminCommunityMutations();

  // Estados locales para el formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");

  // Rellenamos el formulario con los datos de la comunidad cuando se abre el diálogo
  useEffect(() => {
    if (community) {
      setName(community.name);
      setSlug(community.slug);
      setDescription(community.description || "");
      setStripePriceId(community.stripe_price_id || "");
    }
  }, [community]);

  const handleUpdateCommunity = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("El nombre y el slug son campos requeridos.");
      return;
    }

    updateCommunity(
      {
        id: community.id,
        name,
        slug,
        description,
        stripe_price_id: stripePriceId.trim() || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false); // Cierra el diálogo si la mutación es exitosa
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar Comunidad: {community.name}</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la comunidad.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Comunidad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Comunidad de Coding"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ej: coding (sin espacios ni caracteres especiales)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una breve descripción de la comunidad..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripePriceId">ID del Precio en Stripe</Label>
            <Input
              id="stripePriceId"
              value={stripePriceId}
              onChange={(e) => setStripePriceId(e.target.value)}
              placeholder="Ej: price_1P6... (Opcional)"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleUpdateCommunity}
            disabled={isUpdatingCommunity}
          >
            {isUpdatingCommunity ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
