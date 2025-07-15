// src/components/admin/CreateCategoryDialog.tsx
"use client";

import { useState } from "react";
import { useAdminCategoryMutations } from "@/hooks/useAdminCategoryMutations";
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

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCategoryDialog({
  isOpen,
  onOpenChange,
}: CreateCategoryDialogProps) {
  const { createCategory, isCreatingCategory } = useAdminCategoryMutations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const handleCreateCategory = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required fields.");
      return;
    }

    createCategory(
      { name, slug },
      {
        onSuccess: () => {
          onOpenChange(false); // Close the dialog
          setName(""); // Clear the form
          setSlug("");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Categories help organize courses. The slug is the URL-friendly
            version of the name.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Web Development"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., web-development"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreateCategory} disabled={isCreatingCategory}>
            {isCreatingCategory ? "Creating..." : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
