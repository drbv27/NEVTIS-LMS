// src/components/admin/EditCategoryDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useAdminCategoryMutations } from "@/hooks/useAdminCategoryMutations";
import { type Category } from "@/lib/types";
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

interface EditCategoryDialogProps {
  category: Category;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCategoryDialog({
  category,
  isOpen,
  onOpenChange,
}: EditCategoryDialogProps) {
  const { updateCategory, isUpdatingCategory } = useAdminCategoryMutations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Usamos useEffect para rellenar el formulario cuando el diálogo se abre con una categoría
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
    }
  }, [category]);

  const handleUpdateCategory = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("El nombre y el slug son campos requeridos.");
      return;
    }

    updateCategory(
      { id: category.id, name, slug },
      {
        onSuccess: () => {
          onOpenChange(false); // Cierra el diálogo
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Realiza los cambios necesarios en la categoría.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-edit">Nombre de la Categoría</Label>
            <Input
              id="name-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug-edit">Slug</Label>
            <Input
              id="slug-edit"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpdateCategory} disabled={isUpdatingCategory}>
            {isUpdatingCategory ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
