// src/app/(main)/feed/page.tsx
import FeedList from "@/components/feed/FeedList";

export default function FeedPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Comunidad</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Descubre lo último de nuestra comunidad. ¡Comparte, aprende e
          inspírate!
        </p>
      </div>
      <FeedList />
    </div>
  );
}
