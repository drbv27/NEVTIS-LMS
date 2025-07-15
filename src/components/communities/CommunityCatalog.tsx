// src/components/communities/CommunityCatalog.tsx
"use client";

import { usePublicCommunities } from "@/hooks/usePublicCommunities";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function CommunityCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function CommunityCatalog() {
  const { data: communities, isLoading, error } = usePublicCommunities();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CommunityCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 py-10">
        Error loading communities: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Explore Our Communities
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join a community to access exclusive courses, connect with other
          professionals, and take your skills to the next level.
        </p>
      </div>

      {communities && communities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {communities.map((community) => {
            const isPublished = community.status === "published";
            return (
              <Card
                key={community.id}
                className={cn(
                  "flex flex-col overflow-hidden shadow-lg transition-all duration-300",
                  isPublished
                    ? "hover:shadow-xl"
                    : "opacity-60 grayscale cursor-not-allowed"
                )}
              >
                <div className="relative w-full aspect-video">
                  <Image
                    src={community.image_url || "/images/placeholder.png"}
                    alt={`Image for ${community.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw, 33vw"
                  />
                  {!isPublished && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="mt-2 text-lg font-semibold line-clamp-2">
                    {community.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {community.description || "Explore this community."}
                  </p>
                </CardContent>
                <CardFooter>
                  {isPublished ? (
                    <Link
                      href={`/community/${community.slug}`}
                      className="w-full"
                    >
                      <Button className="w-full">View Community</Button>
                    </Link>
                  ) : (
                    <Button className="w-full" disabled>
                      Coming Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No communities available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
