// src/components/admin/CourseForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useCourseMutations } from "@/hooks/useCourseMutations";
import { useAdminCommunities } from "@/hooks/useAdminCommunities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { type Course } from "@/lib/types";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CourseFormProps {
  initialData?: Course | null;
}

export default function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: communities, isLoading: isLoadingCommunities } =
    useAdminCommunities();
  const { createCourse, isCreatingCourse, updateCourse, isUpdatingCourse } =
    useCourseMutations();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState<number | string>("");
  const [stripePriceId, setStripePriceId] = useState("");

  const isEditing = !!initialData;
  const isSubmitting = isCreatingCourse || isUpdatingCourse;

  useEffect(() => {
    if (isEditing && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setCategoryId(initialData.categories?.id?.toString() || "");
      setCommunityId(initialData.community_id || "");
      setImagePreview(initialData.image_url || null);
      setIsFree(initialData.is_free);
      setPrice(initialData.price || "");
      setStripePriceId(initialData.stripe_price_id || "");
    }
  }, [isEditing, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!communityId) {
      toast.error("You must assign the course to a community.");
      return;
    }

    const payload = {
      title,
      description,
      categoryId: parseInt(categoryId),
      communityId,
      is_free: isFree,
      price: isFree ? null : Number(price),
      stripe_price_id: isFree ? null : stripePriceId,
    };

    if (isEditing) {
      if (!initialData?.id) return;
      updateCourse({
        ...payload,
        courseId: initialData.id,
        imageFile,
      });
    } else {
      if (!title || !categoryId || !imageFile)
        return alert("Please fill out all required fields");
      createCourse({
        ...payload,
        imageFile,
      });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Course" : "Create New Course"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Modify the details of your course."
            : "Complete the details to create a new course."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="community">Community</Label>
            <Select onValueChange={setCommunityId} value={communityId} required>
              <SelectTrigger id="community" disabled={isLoadingCommunities}>
                <SelectValue placeholder="Assign this course to a community..." />
              </SelectTrigger>
              <SelectContent>
                {communities?.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={setCategoryId} value={categoryId} required>
              <SelectTrigger disabled={isLoadingCategories}>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Course Price</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-free-switch"
                checked={isFree}
                onCheckedChange={setIsFree}
              />
              <Label htmlFor="is-free-switch">
                {isFree ? "This course is Free" : "This course is Paid"}
              </Label>
            </div>
          </div>

          {!isFree && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 99.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                <Input
                  id="stripePriceId"
                  placeholder="e.g., price_1P6..."
                  value={stripePriceId}
                  onChange={(e) => setStripePriceId(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="imageFile">Cover Image</Label>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Image preview"
                width={200}
                height={112}
                className="rounded-md object-cover"
              />
            )}
            <Input
              id="imageFile"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              required={!isEditing}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
