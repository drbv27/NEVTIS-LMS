// src/app/(main)/admin/users/page.tsx
"use client"; // 1. CONVERTIMOS LA PÁGINA EN UN COMPONENTE DE CLIENTE

import { useState } from "react"; // 2. IMPORTAMOS useState
import UsersTable from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button"; // 3. IMPORTAMOS Button
import { PlusCircle } from "lucide-react"; // 4. IMPORTAMOS un ícono
import CreateUserDialog from "@/components/admin/CreateUserDialog"; // 5. IMPORTAMOS nuestro nuevo diálogo

export default function AdminUsersPage() {
  // 6. AÑADIMOS ESTADO PARA CONTROLAR LA VISIBILIDAD DEL DIÁLOGO
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Visualiza y administra todos los usuarios de la plataforma.
            </p>
          </div>
          {/* 7. AÑADIMOS EL BOTÓN PARA ABRIR EL DIÁLOGO */}
          <Button onClick={() => setIsCreateUserDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>
        <div>
          <UsersTable />
        </div>
      </div>

      {/* 8. RENDERIZAMOS EL DIÁLOGO Y LE PASAMOS EL ESTADO */}
      <CreateUserDialog
        isOpen={isCreateUserDialogOpen}
        onOpenChange={setIsCreateUserDialogOpen}
      />
    </>
  );
}
