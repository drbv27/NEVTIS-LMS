// src/components/shared/NotFoundOrErrorPage.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX2 } from "lucide-react";

interface NotFoundOrErrorPageProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function NotFoundOrErrorPage({
  title = "Page Not Found or No Access",
  description = "Sorry, but the content you are looking for does not exist, has been moved, or you do not have permission to view it.",
  buttonText = "Back to Course Catalog",
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
