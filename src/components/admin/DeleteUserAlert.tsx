// src/components/admin/DeleteUserAlert.tsx
"use client";

import { useAdminUserMutations } from "@/hooks/useAdminUserMutations";
import { type Profile } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteUserAlertProps {
  user: Profile;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteUserAlert({
  user,
  isOpen,
  onOpenChange,
}: DeleteUserAlertProps) {
  const { deleteUser, isDeletingUser } = useAdminUserMutations();

  const handleDelete = () => {
    deleteUser(
      { userIdToDelete: user.id },
      {
        onSuccess: () => {
          onOpenChange(false); // Cierra la alerta si la eliminación es exitosa
        },
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente al
            usuario{" "}
            <span className="font-semibold text-destructive">
              {user.full_name} ({user.id})
            </span>
            . Su cuenta de autenticación, su perfil, inscripciones y todo el
            contenido asociado serán borrados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingUser}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingUser ? "Eliminando..." : "Sí, eliminar permanentemente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
