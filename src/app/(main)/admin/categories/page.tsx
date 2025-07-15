// src/app/(main)/admin/categories/page.tsx
"use client";

import { useState } from "react";
import CategoriesTable from "@/components/admin/CategoriesTable";
import CreateCategoryDialog from "@/components/admin/CreateCategoryDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminCategoriesPage() {
  // State to manage the create dialog visibility
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all course categories.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      <CategoriesTable />

      <CreateCategoryDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
}
