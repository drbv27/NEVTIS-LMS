// src/components/feed/SearchResultCard.tsx
"use client";

import Link from "next/link";
import { type SearchResult } from "@/hooks/useSearchResults";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Hash, MessageSquare } from "lucide-react";

// A small helper component for the entity type icon
const EntityIcon = ({ type }: { type: SearchResult["entity_type"] }) => {
  switch (type) {
    case "profile":
      return <User className="h-5 w-5 text-muted-foreground" />;
    case "hashtag":
      return <Hash className="h-5 w-5 text-muted-foreground" />;
    case "post":
      return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    default:
      return null;
  }
};

export default function SearchResultCard({ result }: { result: SearchResult }) {
  // Determine the card's link destination based on the entity type
  const getHref = () => {
    switch (result.entity_type) {
      case "profile":
        // TODO: This could link to a public profile page in the future
        return `/profile?userId=${result.entity_id}`;
      case "hashtag":
        return `/feed?tag=${result.entity_id}`;
      case "post":
        // TODO: This could link directly to the post (e.g., open a dialog)
        return `/feed`;
      default:
        return "#";
    }
  };

  return (
    <Link href={getHref()}>
      <Card className="p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border">
            {result.image_url && <AvatarImage src={result.image_url} />}
            <AvatarFallback>
              <EntityIcon type={result.entity_type} />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="font-semibold text-foreground line-clamp-1">
              {result.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {result.description}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
