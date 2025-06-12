"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useCourseMutations } from "@/hooks/useCourseMutations";
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

// El formulario ahora acepta datos iniciales para el modo de edición
interface CourseFormProps {
  initialData?: Course | null;
}

export default function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { createCourse, isCreatingCourse, updateCourse, isUpdatingCourse } =
    useCourseMutations();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEditing = !!initialData;
  const isSubmitting = isCreatingCourse || isUpdatingCourse;

  // Rellenamos el formulario si estamos en modo de edición
  useEffect(() => {
    if (isEditing && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setCategoryId(initialData.categories?.id?.toString() || "");
      setImagePreview(initialData.image_url || null);
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
    if (isEditing) {
      // Lógica de Actualización
      if (!initialData?.id) return;
      updateCourse({
        courseId: initialData.id,
        title,
        description,
        categoryId: parseInt(categoryId),
        imageFile,
      });
    } else {
      // Lógica de Creación
      if (!title || !categoryId || !imageFile)
        return alert("Completa todos los campos");
      createCourse({
        title,
        description,
        categoryId: parseInt(categoryId),
        imageFile,
      });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Curso" : "Crear Nuevo Curso"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modifica los detalles de tu curso."
            : "Completa los detalles para crear un nuevo curso."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* El resto del formulario es igual, pero los valores y acciones son dinámicos */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Curso</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select onValueChange={setCategoryId} value={categoryId} required>
              <SelectTrigger disabled={isLoadingCategories}>
                <SelectValue placeholder="..." />
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
            <Label htmlFor="imageFile">Imagen de Portada</Label>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Vista previa"
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
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Guardando..."
                  : "Creando..."
                : isEditing
                ? "Guardar Cambios"
                : "Crear Curso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
