// src/components/shared/NotFoundOrErrorPage.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX2 } from "lucide-react"; // Un ícono apropiado para "no encontrado"

interface NotFoundOrErrorPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function NotFoundOrErrorPage({
  title = "Página no encontrada o sin acceso",
  description = "Lo sentimos, pero el contenido que buscas no existe, ha sido movido o no tienes permiso para verlo.",
  buttonText = "Volver al catálogo de cursos",
  buttonHref = "/courses",
}: NotFoundOrErrorPageProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh] p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <FileX2 className="mx-auto h-16 w-16 text-destructive" />
          <CardTitle className="text-2xl font-bold mt-4">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{description}</p>
          <Button asChild>
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
