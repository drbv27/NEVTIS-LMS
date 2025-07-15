// src/components/feed/SearchResultCard.tsx
"use client";

import Link from "next/link";
import { type SearchResult } from "@/hooks/useSearchResults";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Hash, MessageSquare } from "lucide-react";

// Un pequeño componente de ayuda para el ícono del tipo de entidad
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
  // Determinamos a dónde debe enlazar la tarjeta según el tipo de entidad
  const getHref = () => {
    switch (result.entity_type) {
      case "profile":
        // A futuro, podríamos tener una página de perfil pública
        return `/profile?userId=${result.entity_id}`;
      case "hashtag":
        return `/feed?tag=${result.entity_id}`;
      case "post":
        // A futuro, podríamos enlazar directamente al post si tenemos un diálogo para ello
        return `/feed`;
      default:
        return "#";
    }
  };

  return (
    <Link href={getHref()}>
      <Card className="p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          {/* Avatar o Ícono */}
          <Avatar className="h-12 w-12 border">
            {result.image_url && <AvatarImage src={result.image_url} />}
            <AvatarFallback>
              <EntityIcon type={result.entity_type} />
            </AvatarFallback>
          </Avatar>

          {/* Contenido de texto */}
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
