// src/components/feed/CreatePostForm.tsx
"use client";

import { useState, useRef } from "react"; // <-- 1. IMPORTAMOS useRef
import { useAuthStore } from "@/store/authStore";
import { useFeed } from "@/hooks/useFeed";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Image as ImageIcon, X } from "lucide-react"; // <-- 2. IMPORTAMOS NUEVOS ICONOS
import Image from "next/image"; // <-- 3. IMPORTAMOS EL COMPONENTE DE IMAGEN DE NEXT

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export default function CreatePostForm() {
  const { user } = useAuthStore();
  const { profile } = useProfile();
  const { createPost, isCreatingPost } = useFeed();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // <-- 4. NUEVO ESTADO PARA EL ARCHIVO
  const [imagePreview, setImagePreview] = useState<string | null>(null); // <-- 5. NUEVO ESTADO PARA LA PREVISUALIZACIÓN
  const imageInputRef = useRef<HTMLInputElement>(null); // <-- 6. NUEVA REFERENCIA PARA EL INPUT DE ARCHIVO

  // 7. NUEVA FUNCIÓN PARA MANEJAR EL CAMBIO DE IMAGEN
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 2. AÑADIMOS LA VALIDACIÓN DE TAMAÑO
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La imagen es demasiado grande. El máximo es 3MB.");
        // Limpiamos el input por si el usuario quiere intentarlo de nuevo
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() && !imageFile) {
      toast.error("El post debe tener contenido o una imagen.");
      return;
    }

    // Llamamos a la mutación con el objeto correcto
    createPost(
      { content: content.trim(), imageFile },
      {
        // Limpiamos el formulario solo cuando la subida es exitosa
        onSuccess: () => {
          setContent("");
          setImageFile(null);
          setImagePreview(null);
          if (imageInputRef.current) {
            imageInputRef.current.value = "";
          }
          toast.success("¡Publicación creada con éxito!");
        },
      }
    );
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <Card className="mb-8 shadow-md">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={profile.full_name || ""}
              />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué estás pensando, ${
                profile.full_name?.split(" ")[0] || "crack"
              }?`}
              rows={3}
              className="mb-2 focus-visible:ring-primary w-full"
              disabled={isCreatingPost}
            />
          </div>

          {/* --- INICIO DE LA NUEVA SECCIÓN DE PREVISUALIZACIÓN --- */}
          {imagePreview && (
            <div className="mt-4 relative w-48 h-48">
              <Image
                src={imagePreview}
                alt="Previsualización del post"
                fill
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {/* --- FIN DE LA NUEVA SECCIÓN DE PREVISUALIZACIÓN --- */}

          <div className="flex justify-between items-center mt-2">
            {/* 8. NUEVO BOTÓN PARA SELECCIONAR IMAGEN */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden" // Ocultamos el input feo
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()} // El botón bonito activa el input oculto
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>

            <Button
              type="submit"
              disabled={isCreatingPost || (!content.trim() && !imageFile)}
            >
              {isCreatingPost ? "Publicando..." : "Publicar"}{" "}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
