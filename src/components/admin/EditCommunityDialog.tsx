// src/components/admin/EditCommunityDialog.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";

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
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Estados locales
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");
  const [status, setStatus] = useState<Community["status"]>("draft");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (community) {
      setName(community.name);
      setSlug(community.slug);
      setDescription(community.description || "");
      setStripePriceId(community.stripe_price_id || "");
      setStatus(community.status || "draft");
      setImagePreview(community.image_url || null);
    }
  }, [community]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
        status,
        imageFile,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Comunidad: {community.name}</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la comunidad.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name-edit">Nombre de la Comunidad</Label>
              <Input
                id="name-edit"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug-edit">Slug (URL)</Label>
              <Input
                id="slug-edit"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description-edit">Descripción</Label>
            <Textarea
              id="description-edit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stripePriceId-edit">
                ID del Precio en Stripe (Opcional)
              </Label>
              <Input
                id="stripePriceId-edit"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-edit">Estado</Label>
              <Select
                onValueChange={(value) =>
                  setStatus(value as Community["status"])
                }
                value={status}
              >
                <SelectTrigger id="status-edit">
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador (Draft)</SelectItem>
                  <SelectItem value="published">
                    Publicado (Published)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageFile-edit">Imagen de Portada</Label>
            {imagePreview && (
              <div className="w-full aspect-video relative rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Vista previa"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Input
              id="imageFile-edit"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
            />
            <p className="text-xs text-muted-foreground">
              Selecciona un archivo solo si deseas reemplazar la imagen actual.
            </p>
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
