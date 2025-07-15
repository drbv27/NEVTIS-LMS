// src/app/(main)/admin/categories/page.tsx
"use client";

import { useState } from "react"; // 1. Importamos useState
import CategoriesTable from "@/components/admin/CategoriesTable";
import CreateCategoryDialog from "@/components/admin/CreateCategoryDialog"; // 2. Importamos el nuevo diálogo
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminCategoriesPage() {
  // 3. Añadimos el estado para controlar el diálogo
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-muted-foreground">
            Crea, edita y administra todas las categorías de los cursos.
          </p>
        </div>
        {/* 4. El botón ahora abre el diálogo */}
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Categoría
        </Button>
      </div>

      <CategoriesTable />

      {/* 5. Renderizamos el diálogo y le pasamos el estado */}
      <CreateCategoryDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}
