// src/components/notifications/NotificationItem.tsx
"use client";

import Link from "next/link";
import { type Notification } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { ThumbsUp, MessageSquare } from "lucide-react";

// Función auxiliar para formatear el tiempo transcurrido
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
  return "justo ahora";
}

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  const notificationText =
    notification.type === "new_like"
      ? "le ha dado me gusta a tu publicación."
      : "ha comentado tu publicación.";

  const icon =
    notification.type === "new_like" ? (
      <ThumbsUp className="h-4 w-4 text-white bg-blue-500 rounded-full p-0.5" />
    ) : (
      <MessageSquare className="h-4 w-4 text-white bg-green-500 rounded-full p-0.5" />
    );

  return (
    <Link
      href={`/post/${notification.post_id}`} // A futuro, esto llevará al post específico
      className="block"
    >
      <div
        className={cn(
          "flex items-start gap-3 p-3 transition-colors hover:bg-muted/50",
          !notification.is_read && "bg-primary/10"
        )}
      >
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.actor_avatar_url || ""} />
            <AvatarFallback>
              {notification.actor_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1">{icon}</span>
        </div>
        <div className="flex-1 text-sm">
          <p>
            <span className="font-semibold">{notification.actor_name}</span>{" "}
            {notificationText}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            "{notification.post_content_preview}..."
          </p>
          <p className="text-xs text-blue-500 mt-2">
            {timeAgo(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1"></div>
        )}
      </div>
    </Link>
  );
}
