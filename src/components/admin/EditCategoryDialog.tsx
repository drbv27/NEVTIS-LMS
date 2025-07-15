// src/components/admin/EditCategoryDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useAdminCategoryMutations } from "@/hooks/useAdminCategoryMutations";
import { type Category } from "@/lib/types";
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
import { toast } from "sonner";

interface EditCategoryDialogProps {
  category: Category;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCategoryDialog({
  category,
  isOpen,
  onOpenChange,
}: EditCategoryDialogProps) {
  const { updateCategory, isUpdatingCategory } = useAdminCategoryMutations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Populate the form with the category data when the dialog opens
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
    }
  }, [category]);

  const handleUpdateCategory = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required fields.");
      return;
    }

    updateCategory(
      { id: category.id, name, slug },
      {
        onSuccess: () => {
          onOpenChange(false); // Close the dialog
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make the necessary changes to the category.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-edit">Category Name</Label>
            <Input
              id="name-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug-edit">Slug</Label>
            <Input
              id="slug-edit"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpdateCategory} disabled={isUpdatingCategory}>
            {isUpdatingCategory ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
