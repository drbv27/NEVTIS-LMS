// src/components/admin/CreateCategoryDialog.tsx
"use client";

import { useState } from "react";
import { useAdminCategoryMutations } from "@/hooks/useAdminCategoryMutations";
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
import { toast } from "sonner";

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCategoryDialog({
  isOpen,
  onOpenChange,
}: CreateCategoryDialogProps) {
  const { createCategory, isCreatingCategory } = useAdminCategoryMutations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleCreateCategory = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("El nombre y el slug son campos requeridos.");
      return;
    }

    createCategory(
      { name, slug },
      {
        onSuccess: () => {
          onOpenChange(false); // Cierra el diálogo
          setName(""); // Limpia el formulario
          setSlug("");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Categoría</DialogTitle>
          <DialogDescription>
            Las categorías ayudan a organizar los cursos. El slug es la versión
            para la URL.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Desarrollo Web"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ej: desarrollo-web"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleCreateCategory} disabled={isCreatingCategory}>
            {isCreatingCategory ? "Creando..." : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
