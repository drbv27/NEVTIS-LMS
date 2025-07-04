// src/components/ui/FullPageLoader.tsx

export default function FullPageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 animate-ping rounded-full bg-primary [animation-delay:-0.3s]"></span>
        <span className="h-3 w-3 animate-ping rounded-full bg-primary [animation-delay:-0.15s]"></span>
        <span className="h-3 w-3 animate-ping rounded-full bg-primary"></span>
      </div>
      <p className="text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
}
