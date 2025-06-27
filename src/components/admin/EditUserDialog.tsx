// src/components/admin/EditUserDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { type Profile } from "@/lib/types";
import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import { useCourseList } from "@/hooks/useCourseList"; // 1. IMPORTAMOS el nuevo hook
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
import { Separator } from "@/components/ui/separator"; // 2. IMPORTAMOS un separador visual

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
  // 3. OBTENEMOS LAS NUEVAS FUNCIONES Y DATOS
  const { updateUser, isUpdatingUser, enrollUser, isEnrollingUser } =
    useAdminUserMutations();
  const { data: courses, isLoading: isLoadingCourses } = useCourseList();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedRole, setSelectedRole] = useState<Profile["role"]>("student");
  // 4. AÑADIMOS ESTADO PARA EL CURSO SELECCIONADO
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setBio(user.bio || "");
      setSelectedRole(user.role);
    }
  }, [user]);

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
          onOpenChange(false);
        },
      }
    );
  };

  // 5. NUEVA FUNCIÓN PARA MANEJAR LA INSCRIPCIÓN MANUAL
  const handleEnroll = () => {
    if (!selectedCourseId) {
      alert("Por favor, selecciona un curso para inscribir.");
      return;
    }
    enrollUser({
      userId: user.id,
      courseId: selectedCourseId,
    });
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

        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          {/* Sección de Editar Perfil (sin cambios) */}
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

          {/* 6. AÑADIMOS LA NUEVA SECCIÓN DE INSCRIPCIÓN */}
          <Separator className="my-6" />
          <div>
            <h3 className="text-lg font-medium">Inscripción Manual</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Inscribe a este usuario en un curso específico.
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={isLoadingCourses}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona un curso..." />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleEnroll}
                disabled={!selectedCourseId || isEnrollingUser}
              >
                {isEnrollingUser ? "Inscribiendo..." : "Inscribir"}
              </Button>
            </div>
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
