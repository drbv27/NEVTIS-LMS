"use client";

import { useEffect, useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile"; // <-- Nuestro nuevo hook
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { user } = useAuthStore();
  // Usamos nuestro hook para obtener datos, estado de carga y la función de actualización
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    bio: "",
    linkedinUrl: "",
    twitterUrl: "",
    githubUrl: "",
  });

  // useEffect solo para rellenar el formulario cuando los datos del perfil llegan
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        phoneNumber: profile.phone_number || "",
        bio: profile.bio || "",
        linkedinUrl: profile.social_links?.linkedin || "",
        twitterUrl: profile.social_links?.twitter || "",
        githubUrl: profile.social_links?.github || "",
      });
    }
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // La lógica de la mutación está ahora en el hook
    updateProfile({
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      bio: formData.bio,
      social_links: {
        linkedin: formData.linkedinUrl,
        twitter: formData.twitterUrl,
        github: formData.githubUrl,
      },
      updated_at: new Date().toISOString(),
    });
  };

  if (isLoading) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Tu Perfil</CardTitle>
        <CardDescription>
          Actualiza tu información personal y profesional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          {/* ... Resto de los inputs ... */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número de Teléfono</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="min-h-[100px]"
            />
          </div>
          <h3 className="text-lg font-medium border-t pt-6">Redes Sociales</h3>
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/tuperfil"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitterUrl">Twitter/X URL</Label>
            <Input
              id="twitterUrl"
              name="twitterUrl"
              type="url"
              placeholder="https://x.com/tuusuario"
              value={formData.twitterUrl}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/tuusuario"
              value={formData.githubUrl}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
