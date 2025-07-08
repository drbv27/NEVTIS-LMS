// src/components/notifications/NotificationsPanel.tsx
"use client";

import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { BellRing, CheckCheck } from "lucide-react";

export default function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    isMarkingAsRead,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notificaciones</h3>
        {unreadCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAsRead}
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Marcar todas como leídas
          </Button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground p-8">
            <BellRing className="mx-auto h-8 w-8 mb-2" />
            <p>No tienes notificaciones.</p>
          </div>
        )}
      </div>
    </div>
  );
}
