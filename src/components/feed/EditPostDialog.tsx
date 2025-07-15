//src/components/feed/EditPostDialog.tsx
"use client";

import { useState } from "react";
import { useFeed } from "@/hooks/useFeed";
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
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/lib/types";

interface EditPostDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPostDialog({
  post,
  isOpen,
  onOpenChange,
}: EditPostDialogProps) {
  const [content, setContent] = useState(post.content);
  const { updatePost, isUpdatingPost } = useFeed();

  const handleUpdate = () => {
    if (!content.trim()) return;
    updatePost(
      { postId: post.id, content },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to your post here. Click &quot;Save Changes&quot; when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="my-4"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpdate} disabled={isUpdatingPost}>
            {isUpdatingPost ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
