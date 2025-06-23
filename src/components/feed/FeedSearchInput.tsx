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
      toast.info("Por favor, introduce un término para buscar.");
      return;
    }

    // Redirigimos a una página de resultados dedicada, pasando el término como un query param
    router.push(`/feed/search?q=${encodeURIComponent(trimmedTerm)}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="flex w-full max-w-lg items-center space-x-2 mb-8"
    >
      <Input
        type="text"
        placeholder="Buscar usuarios, posts o #hashtags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" /> Buscar
      </Button>
    </form>
  );
}
