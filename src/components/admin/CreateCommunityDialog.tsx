// src/components/admin/CreateCommunityDialog.tsx
"use client";

import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { type Community } from "@/lib/types";

interface CreateCommunityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCommunityDialog({
  isOpen,
  onOpenChange,
}: CreateCommunityDialogProps) {
  const { createCommunity, isCreatingCommunity } = useAdminCommunityMutations();
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Estados locales para el formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");
  const [status, setStatus] = useState<Community["status"]>("draft");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Función para resetear el formulario
  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setStripePriceId("");
    setStatus("draft");
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateCommunity = () => {
    if (!name.trim() || !slug.trim() || !imageFile) {
      toast.error("El nombre, el slug y la imagen son campos requeridos.");
      return;
    }

    createCommunity(
      {
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
          resetForm();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Comunidad</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear una nueva comunidad.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Comunidad</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stripePriceId">
                ID del Precio en Stripe (Opcional)
              </Label>
              <Input
                id="stripePriceId"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                onValueChange={(value) =>
                  setStatus(value as Community["status"])
                }
                value={status}
              >
                <SelectTrigger id="status">
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
            <Label htmlFor="imageFile">Imagen de Portada</Label>
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
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
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
