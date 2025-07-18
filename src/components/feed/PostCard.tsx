// src/components/feed/PostCard.tsx
"use client";

import { useState, forwardRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useProfile } from "@/hooks/useProfile";
import { useFeed } from "@/hooks/useFeed";
import { type Post } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  ThumbsUp,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import EditPostDialog from "./EditPostDialog";
import DeletePostAlert from "./DeletePostAlert";
import CommentsDialog from "./CommentsDialog";

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  return "a few seconds ago";
}

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

// Wrap the component with forwardRef to allow passing a ref to the root DOM element.
const PostCard = forwardRef<HTMLDivElement, { post: Post }>(({ post }, ref) => {
  const { user } = useAuthStore();
  const { toggleLike, isLiking } = useFeed();
  const { toggleFollow, isFollowing } = useProfile();

  const isAuthor = user?.id === post.user_id;
  const isLikedByMe = post.is_liked_by_me;
  const isFollowedByAuthor = post.is_followed_by_me;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleFollow = () => {
    if (!isAuthor) {
      toggleFollow(post.user_id);
    }
  };

  return (
    <>
      {/* Assign the forwarded ref to the root Card element. */}
      <Card ref={ref} className="overflow-hidden shadow-md">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src={post.author_avatar_url || undefined}
                  alt={post.author_full_name || "Avatar"}
                />
                <AvatarFallback>
                  {post.author_full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {post.author_full_name || "Anonymous User"}
                  </p>
                  {!isAuthor && (
                    <>
                      <span className="text-muted-foreground">&middot;</span>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={handleFollow}
                        disabled={isFollowing}
                      >
                        {isFollowedByAuthor ? "Following" : "Follow"}
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(post.created_at)}
                </p>
              </div>
            </div>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <span className="sr-only">Post options</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
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
        </CardContent>
        <CardFooter className="p-2 sm:p-3 border-t bg-muted/50 flex justify-around">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full transition-colors ${
              isLikedByMe ? "text-[#FF8C61]" : "text-muted-foreground"
            } hover:text-primary`}
            onClick={() => toggleLike(post.id)}
            disabled={isLiking}
          >
            <ThumbsUp
              className="mr-2 h-4 w-4"
              fill={isLikedByMe ? "#FF8C61" : "none"}
            />
            ({post.likes_count}) Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full"
            onClick={() => setIsCommentsOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> ({post.comments_count})
            Comment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary w-full"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </CardFooter>
      </Card>
      <CommentsDialog
        post={post}
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
      />
      {isAuthor && (
        <>
          <EditPostDialog
            post={post}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
          <DeletePostAlert
            post={post}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
});

// Add a displayName for easier debugging in React DevTools.
PostCard.displayName = "PostCard";

export default PostCard;
