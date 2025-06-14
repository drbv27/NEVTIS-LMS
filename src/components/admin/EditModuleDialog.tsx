//src/components/admin/EditModuleDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useCourseMutations } from "@/hooks/useCourseMutations";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Module } from "@/lib/types";

interface EditModuleDialogProps {
  module: Module;
  courseId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditModuleDialog({
  module,
  courseId,
  isOpen,
  onOpenChange,
}: EditModuleDialogProps) {
  const [title, setTitle] = useState(module.title);
  const { updateModule, isUpdatingModule } = useCourseMutations();

  useEffect(() => {
    setTitle(module.title);
  }, [module]);

  const handleUpdate = () => {
    if (!title.trim()) return;
    updateModule(
      { moduleId: module.id, courseId, title },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
          <DialogDescription>
            Cambia el nombre de tu módulo aquí.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="module-title">Título del Módulo</Label>
          <Input
            id="module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isUpdatingModule}>
            {isUpdatingModule ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
