// src/components/admin/CreateCommunityDialog.tsx
"use client";

import { useState } from "react";
import { useAdminCommunityMutations } from "@/hooks/useAdminCommunityMutations";
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

interface CreateCommunityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCommunityDialog({
  isOpen,
  onOpenChange,
}: CreateCommunityDialogProps) {
  const { createCommunity, isCreatingCommunity } = useAdminCommunityMutations();

  // Estados locales para el formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");

  // Función para resetear el formulario
  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setStripePriceId("");
  };

  const handleCreateCommunity = () => {
    // Validaciones simples
    if (!name.trim() || !slug.trim()) {
      toast.error("El nombre y el slug son campos requeridos.");
      return;
    }

    createCommunity(
      {
        name,
        slug,
        description,
        image_url: null, // Por ahora no manejamos la subida de imágenes
        stripe_price_id: stripePriceId.trim() || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false); // Cierra el diálogo
          resetForm(); // Limpia el formulario para la próxima vez
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Comunidad</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear una nueva comunidad en la
            plataforma.
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
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreateCommunity}
            disabled={isCreatingCommunity}
          >
            {isCreatingCommunity ? "Creando..." : "Crear Comunidad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
