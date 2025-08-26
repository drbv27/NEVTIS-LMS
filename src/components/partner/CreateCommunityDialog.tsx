// src/components/partner/CreateCommunityDialog.tsx
"use client";

import { useState, useRef } from "react";
import { usePartnerCommunityMutations } from "@/hooks/usePartnerCommunityMutations";
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
import { toast } from "sonner";
import Image from "next/image";

interface CreateCommunityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCommunityDialog({
  isOpen,
  onOpenChange,
}: CreateCommunityDialogProps) {
  const { createCommunity, isCreatingCommunity } =
    usePartnerCommunityMutations();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [stripePriceId, setStripePriceId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setStripePriceId("");
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateCommunity = () => {
    if (!name.trim() || !slug.trim() || !imageFile || !stripePriceId.trim()) {
      toast.error("Name, slug, Stripe Price ID, and image are required.");
      return;
    }

    createCommunity(
      { name, slug, description, stripe_price_id: stripePriceId, imageFile },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Complete the details to create a new community.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripePriceId">Stripe Price ID</Label>
            <Input
              id="stripePriceId"
              value={stripePriceId}
              onChange={(e) => setStripePriceId(e.target.value)}
              placeholder="price_1P6..."
            />
            <p className="text-xs text-muted-foreground">
              Create a Product and a recurring Price in your Stripe Dashboard
              and paste the Price ID here.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageFile">Cover Image</Label>
            {imagePreview && (
              <div className="w-full aspect-video relative rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Image preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleCreateCommunity}
            disabled={isCreatingCommunity}
          >
            {isCreatingCommunity ? "Creating..." : "Create Community"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
