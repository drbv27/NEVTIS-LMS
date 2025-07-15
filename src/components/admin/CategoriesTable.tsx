// src/components/admin/CategoriesTable.tsx
"use client";

import { useState } from "react";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { type Category } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import TableSkeleton from "@/components/shared/TableSkeleton";
import EditCategoryDialog from "./EditCategoryDialog";
import DeleteCategoryAlert from "./DeleteCategoryAlert";

export default function CategoriesTable() {
  const { data: categories, isLoading, error } = useAdminCategories();

  // State to manage which category is being edited
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  // State to manage which category is targeted for deletion
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  if (isLoading) {
    return <TableSkeleton columns={3} />;
  }

  if (error) {
    return (
      <p className="text-destructive">
        Error loading categories: {error.message}
      </p>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Name</TableHead>
              <TableHead className="w-[45%]">Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <code className="text-sm text-muted-foreground">
                    {category.slug}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setCategoryToEdit(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setCategoryToDelete(category)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {categoryToEdit && (
        <EditCategoryDialog
          category={categoryToEdit}
          isOpen={!!categoryToEdit}
          onOpenChange={() => setCategoryToEdit(null)}
        />
      )}

      {/* Render the delete confirmation alert when a category is selected */}
      {categoryToDelete && (
        <DeleteCategoryAlert
          category={categoryToDelete}
          isOpen={!!categoryToDelete}
          onOpenChange={() => setCategoryToDelete(null)}
        />
      )}
    </>
  );
}
