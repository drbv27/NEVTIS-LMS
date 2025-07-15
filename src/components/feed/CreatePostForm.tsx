// src/components/feed/CreatePostForm.tsx
"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFeed } from "@/hooks/useFeed";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Send, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export default function CreatePostForm() {
  // Get the active community ID from the store
  const { user, activeCommunityId } = useAuthStore();
  const { profile } = useProfile();
  const { createPost, isCreatingPost } = useFeed();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image is too large. The maximum size is 3MB.");
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
      toast.error("Post must have content or an image.");
      return;
    }
    // Ensure an active community is selected before posting
    if (!activeCommunityId) {
      toast.error("You must select a community to post.");
      return;
    }
    // Pass the communityId to the mutation
    createPost(
      { content: content.trim(), imageFile, communityId: activeCommunityId },
      {
        onSuccess: () => {
          setContent("");
          setImageFile(null);
          setImagePreview(null);
          if (imageInputRef.current) {
            imageInputRef.current.value = "";
          }
          toast.success("Post created successfully!");
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
              placeholder={`What's on your mind, ${
                profile.full_name?.split(" ")[0] || "friend"
              }?`}
              rows={3}
              className="mb-2 focus-visible:ring-primary w-full"
              disabled={isCreatingPost}
            />
          </div>

          {imagePreview && (
            <div className="mt-4 relative w-48 h-48">
              <Image
                src={imagePreview}
                alt="Post preview"
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
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
              aria-label="Add image"
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              type="submit"
              disabled={isCreatingPost || (!content.trim() && !imageFile)}
            >
              {isCreatingPost ? "Posting..." : "Post"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
