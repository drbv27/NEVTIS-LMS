//src/components/lessons/PdfViewer.tsx
"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// The key to fixing "Failed to load PDF file" errors is using the path
// to the local worker file in the /public folder.
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Error loading PDF document:", error);
    toast.error(`Error loading PDF: ${error.message}`);
  }, []);

  const goToPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goToNextPage = () =>
    setPageNumber((p) => Math.min(p + 1, numPages || 1));
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="w-full h-full flex flex-col items-center bg-muted/30">
      <div className="w-full p-2 bg-background border-b shadow-sm flex items-center justify-center space-x-2 flex-wrap sticky top-0 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pageNumber} of {numPages || "..."}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages || 0)}
          aria-label="Next Page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <span className="mx-2 border-l h-6"></span>
        <Button
          variant="outline"
          size="icon"
          title="Zoom Out"
          onClick={zoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" title="Zoom In" onClick={zoomIn}>
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" title="Rotate" onClick={rotate}>
          <RotateCcw className="h-5 w-5" />
        </Button>
        <span className="mx-2 border-l h-6"></span>
        <Button variant="ghost" size="icon" title="Download PDF" asChild>
          <a href={pdfUrl} download>
            <Download className="h-5 w-5" />
          </a>
        </Button>
      </div>

      <div className="flex-1 w-full overflow-auto flex justify-center p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<p>Loading PDF...</p>}
          error={
            <p className="text-destructive">Failed to load PDF document.</p>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            className="flex justify-center"
          />
        </Document>
      </div>
    </div>
  );
}
