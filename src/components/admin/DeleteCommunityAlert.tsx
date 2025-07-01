// src/components/admin/DeleteCommunityAlert.tsx
"use client";

import { useAdminCommunityMutations } from "@/hooks/useAdminCommunityMutations";
import { type Community } from "@/lib/types";
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
import { toast } from "sonner";

interface DeleteCommunityAlertProps {
  community: Community;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteCommunityAlert({
  community,
  isOpen,
  onOpenChange,
}: DeleteCommunityAlertProps) {
  const { deleteCommunity, isDeletingCommunity } = useAdminCommunityMutations();

  const handleDelete = () => {
    // Advertencia: La eliminación en cascada borrará cursos y posts.
    // Asegurarse de que el usuario entiende esto es crucial.
    deleteCommunity(
      { id: community.id },
      {
        onSuccess: () => {
          onOpenChange(false); // Cierra la alerta si la eliminación es exitosa
        },
        onError: (error) => {
          // El toast de error ya se muestra en el hook, pero podríamos añadir lógica extra aquí si fuera necesario.
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
            Esta acción no se puede deshacer. Se eliminará permanentemente la
            comunidad{" "}
            <span className="font-semibold text-destructive">
              {community.name}
            </span>
            . Todos los **cursos y publicaciones** asociados a esta comunidad
            también serán eliminados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeletingCommunity}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeletingCommunity
              ? "Eliminando..."
              : "Sí, eliminar permanentemente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
