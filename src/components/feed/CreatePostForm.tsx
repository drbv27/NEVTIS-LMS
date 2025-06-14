//src/components/feed/CreatePostForm.tsx
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFeed } from "@/hooks/useFeed";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function CreatePostForm() {
  const { user } = useAuthStore();
  const { profile } = useProfile();
  const { createPost, isCreatingPost } = useFeed();
  const [content, setContent] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      toast.error("El contenido no puede estar vacío.");
      return;
    }

    createPost(content.trim(), {
      onSuccess: () => {
        setContent("");
      },
    });
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <Card className="mb-8 shadow-md">
      <CardContent className="p-4">
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
          <form onSubmit={handleSubmit} className="w-full">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué estás pensando, ${
                profile.full_name?.split(" ")[0] || "crack"
              }?`}
              rows={3}
              className="mb-2 focus-visible:ring-primary"
              disabled={isCreatingPost}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isCreatingPost || !content.trim()}
              >
                {isCreatingPost ? "Publicando..." : "Publicar"}{" "}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
