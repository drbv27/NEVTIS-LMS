// src/components/feed/CommentsDialog.tsx
"use client";

import { useState } from "react";
import { type Post, type Comment } from "@/lib/types";
import { useComments } from "@/hooks/useComments";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useFeed } from "@/hooks/useFeed";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Trash2 } from "lucide-react";
import Image from "next/image";
import DeleteCommentAlert from "./DeleteCommentAlert";

const renderWithLinksAndHashtags = (text: string) => {
  const regex = /(#\w+|\bhttps?:\/\/\S+|\bwww\.\S+)/g;
  return text.split(regex).map((part, index) => {
    if (part.match(regex)) {
      if (part.startsWith("#")) {
        const tag = part.substring(1);
        return (
          <Link
            href={`/feed?tag=${tag}`}
            key={index}
            className="text-primary hover:underline"
          >
            {part}
          </Link>
        );
      } else {
        const href = part.startsWith("www.") ? `http://${part}` : part;
        return (
          <a
            href={href}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
    }
    return part;
  });
};

interface CommentsDialogProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommentsDialog({
  post,
  isOpen,
  onOpenChange,
}: CommentsDialogProps) {
  const { user } = useAuthStore();
  const { data: comments, isLoading, error } = useComments(post.id);
  const { profile } = useProfile();
  const { createComment, isCreatingComment, deleteComment, isDeletingComment } =
    useFeed();
  const [newComment, setNewComment] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment(
      { postId: post.id, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  const handleDeleteComment = () => {
    if (!commentToDelete) return;
    deleteComment(
      { commentId: commentToDelete.id, postId: post.id },
      {
        onSuccess: () => {
          setCommentToDelete(null); // Close the alert on success
        },
      }
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Post by {post.author_full_name}</DialogTitle>
            <DialogDescription>
              Viewing comments and responding to this post.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="pb-4 border-b">
                <p className="text-foreground whitespace-pre-wrap">
                  {renderWithLinksAndHashtags(post.content)}
                </p>
                {post.image_url && (
                  <div className="mt-4 relative aspect-video rounded-md overflow-hidden border">
                    <Image
                      src={post.image_url}
                      alt="Post image"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
              {isLoading && <p className="text-center">Loading comments...</p>}
              {error && (
                <p className="text-center text-destructive">
                  Error: {error.message}
                </p>
              )}

              {comments &&
                comments.map((comment) => {
                  const isCommentAuthor = user?.id === comment.user_id;
                  return (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 group"
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage
                          src={comment.profiles?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {comment.profiles?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm w-full">
                        <p className="font-semibold text-foreground">
                          {comment.profiles?.full_name}
                        </p>
                        <p className="text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                      {isCommentAuthor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setCommentToDelete(comment)}
                          title="Delete comment"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
            </div>
            <div className="p-4 border-t bg-background">
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-2"
              >
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  placeholder="Write a comment..."
                  className="flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isCreatingComment}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newComment.trim() || isCreatingComment}
                  aria-label="Send comment"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Render the delete confirmation alert conditionally */}
      {commentToDelete && (
        <DeleteCommentAlert
          isOpen={!!commentToDelete}
          onOpenChange={() => setCommentToDelete(null)}
          onConfirmDelete={handleDeleteComment}
          isDeleting={isDeletingComment}
        />
      )}
    </>
  );
}
