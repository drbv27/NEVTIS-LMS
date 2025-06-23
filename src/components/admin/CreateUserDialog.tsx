// src/components/admin/CreateUserDialog.tsx
"use client";

import { useState } from "react";
import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import { type Profile } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateUserDialog({
  isOpen,
  onOpenChange,
}: CreateUserDialogProps) {
  const { createUser, isCreatingUser } = useAdminUserMutations();

  // Estados locales para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Profile["role"]>("student");

  // Función para resetear el formulario
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setSelectedRole("student");
  };

  const handleCreateUser = () => {
    // Validaciones simples
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    createUser(
      {
        email,
        password,
        full_name: fullName,
        role: selectedRole,
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
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear una nueva cuenta en la plataforma.
            El usuario recibirá un correo para confirmar su cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Ada Lovelace"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña Temporal</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Una contraseña segura"
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
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleCreateUser} disabled={isCreatingUser}>
            {isCreatingUser ? "Creando..." : "Crear Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
