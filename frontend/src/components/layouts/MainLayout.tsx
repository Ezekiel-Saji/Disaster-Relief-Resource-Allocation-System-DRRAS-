"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layouts/Sidebar";
import { TopNav } from "@/components/layouts/TopNav";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InAppNotification,
  NOTIFICATION_EVENT,
} from "@/lib/page-notifications";

const PAGE_SUGGESTIONS: Record<
  string,
  Array<{ title: string; message: string; type: InAppNotification["type"] }>
> = {
  "/": [
    {
      title: "Global overview",
      message: "Check active disasters, pending requests, dispatches, and deliveries before making new operational decisions.",
      type: "Info",
    },
  ],
  "/disasters": [
    {
      title: "Disaster workflow",
      message: "After registering a disaster, the next critical step is linking affected areas so field operations can begin.",
      type: "Alert",
    },
  ],
  "/areas": [
    {
      title: "Affected area review",
      message: "Use severity, population, and last assistance to identify which zones need immediate relief support.",
      type: "Alert",
    },
  ],
  "/centers": [
    {
      title: "Center readiness",
      message: "New centers should be stocked quickly so they can participate in allocations and dispatch planning.",
      type: "Info",
    },
  ],
  "/inventory": [
    {
      title: "Stock vigilance",
      message: "Track available and reserved quantities carefully so critical buffers are protected before allocation.",
      type: "Alert",
    },
  ],
  "/requests": [
    {
      title: "Request handling",
      message: "Pending requests should be reviewed promptly and escalated to allocation when urgency and stock justify action.",
      type: "Request",
    },
  ],
  "/allocations": [
    {
      title: "Allocation control",
      message: "Prioritize high-risk and long-waiting requests so resources are assigned where impact is greatest.",
      type: "Info",
    },
  ],
  "/dispatch": [
    {
      title: "Dispatch execution",
      message: "Once allocation is approved, dispatch should be created quickly to reduce response delay.",
      type: "Dispatch",
    },
  ],
  "/deliveries": [
    {
      title: "Delivery verification",
      message: "Record receipt and discrepancies quickly so assistance history and audit trails remain accurate.",
      type: "Delivery",
    },
  ],
  "/history": [
    {
      title: "Historical learning",
      message: "Use past disaster patterns to guide preparedness decisions, stock positioning, and operational planning.",
      type: "Info",
    },
  ],
  "/predictions": [
    {
      title: "Preparedness signal",
      message: "High prediction scores should influence pre-positioning, buffer inventory, and response readiness.",
      type: "Alert",
    },
  ],
  "/reports": [
    {
      title: "Reporting insight",
      message: "Compare demand, allocation, dispatch, and delivery performance before changing field strategy.",
      type: "Info",
    },
  ],
  "/weather": [
    {
      title: "Weather watch",
      message: "Severe weather shifts should be reviewed alongside risk predictions and current resource readiness.",
      type: "Alert",
    },
  ],
  "/settings": [
    {
      title: "System caution",
      message: "Configuration changes should be made carefully because they can affect live disaster workflows.",
      type: "Info",
    },
  ],
};

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const suggestions = PAGE_SUGGESTIONS[pathname] ?? [];
  const pageNotifications = notifications.filter(
    (notification) => notification.page === pathname
  );
  const combinedNotifications: InAppNotification[] =
    pageNotifications.length > 0
      ? pageNotifications.slice(0, 1)
      : suggestions.map((suggestion, index) => ({
          id: `suggestion-${pathname}-${index}`,
          page: pathname,
          title: suggestion.title,
          message: suggestion.message,
          type: suggestion.type,
        }));

  useEffect(() => {
    const handleNotification = (
      event: Event
    ) => {
      const detail = (event as CustomEvent<Omit<InAppNotification, "id">>).detail;
      const nextNotification: InAppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...detail,
      };

      setNotifications((current) => {
        const latestForPage = current.find(
          (notification) => notification.page === nextNotification.page
        );
        if (
          latestForPage &&
          latestForPage.title === nextNotification.title &&
          latestForPage.message === nextNotification.message &&
          latestForPage.type === nextNotification.type
        ) {
          return current;
        }

        const notificationsForOtherPages = current.filter(
          (notification) => notification.page !== nextNotification.page
        );

        return [nextNotification, ...notificationsForOtherPages].slice(0, 10);
      });
      setIsNotificationOpen(true);
    };

    window.addEventListener(NOTIFICATION_EVENT, handleNotification as EventListener);

    return () => {
      window.removeEventListener(
        NOTIFICATION_EVENT,
        handleNotification as EventListener
      );
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in and not on login page, children won't be seen anyway because of AuthContext redirect
  // But we want to hide Sidebar/TopNav on login page and when not logged in
  if (!user || pathname === "/login") {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="relative flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
        <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Bell className="h-5 w-5" />
                Notifications
              </DialogTitle>
              <DialogDescription>
                Operational updates and page-specific guidance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {combinedNotifications.length > 0 ? (
                combinedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-xl border border-border bg-muted/15 px-4 py-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {notification.title}
                      </p>
                      <Badge variant="outline">{notification.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No action notifications or page guidance are available right now.
                </p>
              )}
              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsNotificationOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
