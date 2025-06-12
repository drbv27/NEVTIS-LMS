"use client";

import { useState } from "react";
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

export default function CreateCourseForm() {
  const router = useRouter();
  // Hooks para obtener datos y acciones
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { createCourse, isCreatingCourse } = useCourseMutations();

  // Estado local del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !categoryId || !imageFile) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    createCourse({
      title,
      description,
      categoryId: parseInt(categoryId),
      imageFile,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nuevo Curso</CardTitle>
        <CardDescription>
          Completa los detalles para crear un nuevo curso en la plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Curso</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Introducción a React"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe de qué trata el curso..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select onValueChange={setCategoryId} value={categoryId} required>
              <SelectTrigger disabled={isLoadingCategories}>
                <SelectValue
                  placeholder={
                    isLoadingCategories
                      ? "Cargando..."
                      : "Selecciona una categoría"
                  }
                />
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
            <Input
              id="imageFile"
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              required
              accept="image/jpeg, image/png, image/webp"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreatingCourse}>
              {isCreatingCourse ? "Creando Curso..." : "Crear Curso"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
