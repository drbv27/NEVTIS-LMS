// components/lessons/LessonTypeIcon.tsx
import { FileText, MonitorPlay, Type } from "lucide-react";
import { Lesson } from "@/lib/types";

interface LessonTypeIconProps {
  type: Lesson["lesson_type"];
  className?: string;
}

export default function LessonTypeIcon({
  type,
  className = "h-5 w-5 flex-shrink-0",
}: LessonTypeIconProps) {
  switch (type) {
    case "video":
      return <MonitorPlay className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "text":
      return <Type className={className} />;
    default:
      return null;
  }
}
