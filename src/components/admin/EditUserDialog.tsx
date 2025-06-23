// src/components/admin/EditUserDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { type Profile } from "@/lib/types";
import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
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
import { Input } from "@/components/ui/input"; // 1. IMPORTAMOS Input
import { Textarea } from "@/components/ui/textarea"; // 2. IMPORTAMOS Textarea
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditUserDialogProps {
  user: Profile;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
}: EditUserDialogProps) {
  const { updateUser, isUpdatingUser } = useAdminUserMutations();

  // 3. AÑADIMOS ESTADOS LOCALES PARA LOS NUEVOS CAMPOS
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedRole, setSelectedRole] = useState<Profile["role"]>("student");

  // Rellenamos todos los campos del formulario cuando el usuario cambia
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setSelectedRole(user.role);
    }
  }, [user]);

  // 4. ACTUALIZAMOS EL MANEJADOR PARA ENVIAR TODOS LOS DATOS
  const handleSaveChanges = () => {
    if (!fullName.trim()) {
      alert("El nombre completo no puede estar vacío.");
      return;
    }
    updateUser(
      {
        userId: user.id,
        role: selectedRole,
        full_name: fullName,
        bio: bio,
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
          <DialogTitle>Editar Usuario: {user.full_name}</DialogTitle>
          <DialogDescription>
            Modifica la información y los permisos del usuario.
          </DialogDescription>
        </DialogHeader>

        {/* 5. AÑADIMOS LOS NUEVOS CAMPOS AL FORMULARIO */}
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Una breve descripción del usuario..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-select">Rol del Usuario</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as Profile["role"])
              }
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Seleccionar un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Estudiante</SelectItem>
                <SelectItem value="teacher">Profesor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isUpdatingUser}>
            {isUpdatingUser ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
