// src/components/feed/FeedSearchInput.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function FeedSearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm) {
      toast.info("Please enter a term to search.");
      return;
    }

    // Redirect to a dedicated results page, passing the term as a query parameter
    router.push(`/feed/search?q=${encodeURIComponent(trimmedTerm)}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex w-full max-w-lg items-center space-x-2 mb-8"
    >
      <Input
        type="text"
        placeholder="Search for users, posts, or #hashtags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" /> Search
      </Button>
    </form>
  );
}
