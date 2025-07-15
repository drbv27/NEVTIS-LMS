// src/app/(main)/feed/page.tsx
import FeedList from "@/components/feed/FeedList";

export default function FeedPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Community</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover the latest from our community. Share, learn, and get
          inspired!
        </p>
      </div>
      <FeedList />
    </div>
  );
}
