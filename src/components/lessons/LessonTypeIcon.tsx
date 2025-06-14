// src/components/lessons/LessonTypeIcon.tsx
import {
  FileText,
  MonitorPlay,
  Type,
  Code,
  ClipboardCheck,
} from "lucide-react";
import { Lesson } from "@/lib/types";

interface LessonTypeIconProps {
  type: Lesson["lesson_type"];
  className?: string;
}

export default function LessonTypeIcon({
  type,
  className = "h-5 w-5 shrink-0",
}: LessonTypeIconProps) {
  // Añadimos los nuevos casos al switch
  switch (type) {
    case "video":
      return <MonitorPlay className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "text":
      return <Type className={className} />;
    case "code":
      return <Code className={className} />;
    case "quiz":
      return <ClipboardCheck className={className} />;
    default:
      return null;
  }
}
