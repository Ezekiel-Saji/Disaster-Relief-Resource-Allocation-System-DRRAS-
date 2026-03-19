"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layouts/Sidebar";
import { TopNav } from "@/components/layouts/TopNav";
import { usePathname } from "next/navigation";
import {
  InAppNotification,
  NOTIFICATION_EVENT,
} from "@/lib/page-notifications";
import { supabase } from "@/lib/supabase";

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
  const [globalEmergencyAlert, setGlobalEmergencyAlert] =
    useState<InAppNotification | null>(null);
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
          source: "guidance" as const,
        }));
  const activeNotification =
    globalEmergencyAlert ?? (isNotificationOpen ? combinedNotifications[0] ?? null : null);

  const createGlobalEmergencyAlert = async (): Promise<InAppNotification | null> => {
    try {
      const { data, error } = await supabase
        .from("v_area_requests")
        .select("request_id, area, resource, urgency, status, date")
        .order("date", { ascending: false });

      if (error) throw error;

      const priorityRank: Record<string, number> = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      };

      const outstandingRequests =
        data?.filter((request) =>
          ["Pending", "Approved"].includes(request.status)
        ) ?? [];

      if (outstandingRequests.length === 0) {
        return null;
      }

      const highestPriorityRequest = outstandingRequests.sort((left, right) => {
        const priorityDelta =
          (priorityRank[right.urgency] ?? 0) - (priorityRank[left.urgency] ?? 0);

        if (priorityDelta !== 0) {
          return priorityDelta;
        }

        return new Date(right.date).getTime() - new Date(left.date).getTime();
      })[0];

      const isUrgent =
        highestPriorityRequest.urgency === "Critical" ||
        highestPriorityRequest.urgency === "High";

      return {
        id: "global-emergency-alert",
        page: "/requests",
        title: "Emergency Alert",
        message: `Request #${highestPriorityRequest.request_id} from ${highestPriorityRequest.area} for ${highestPriorityRequest.resource} is awaiting allocation.`,
        type: "Alert",
        source: "reminder",
        urgent: isUrgent,
      };
    } catch (error) {
      console.error("Error creating global emergency alert:", error);
      return null;
    }
  };

  const createPageReminder = async (
    currentPath: string
  ): Promise<Omit<InAppNotification, "id"> | null> => {
    try {
      if (currentPath === "/requests") {
        const { data, error } = await supabase
          .from("v_area_requests")
          .select("request_id, area, resource, urgency, status, date")
          .order("date", { ascending: false });

        if (error) throw error;
        const pendingRequest = data?.find((request) =>
          ["Pending", "Approved"].includes(request.status)
        );

        if (pendingRequest) {
          return {
            page: currentPath,
            title:
              pendingRequest.urgency === "Critical"
                ? "Critical Request Requires Immediate Allocation"
                : "Pending Requests Require Review",
            message: `Request #${pendingRequest.request_id} from ${pendingRequest.area} for ${pendingRequest.resource} is awaiting allocation action.`,
            type: "Request",
            source: "reminder",
            urgent: pendingRequest.urgency === "Critical",
          };
        }
      }

      if (currentPath === "/allocations") {
        const { count, error } = await supabase
          .from("v_pending_requests")
          .select("request_id", { count: "exact", head: true });

        if (error) throw error;
        if ((count || 0) > 0) {
          return {
            page: currentPath,
            title: "Allocations Are Pending",
            message: `${count} request${count === 1 ? "" : "s"} ${count === 1 ? "is" : "are"} still awaiting resource allocation.`,
            type: "Alert",
            source: "reminder",
          };
        }
      }

      if (currentPath === "/dispatch") {
        const { count, error } = await supabase
          .from("v_ready_for_dispatch")
          .select("allocation_id", { count: "exact", head: true });

        if (error) throw error;
        if ((count || 0) > 0) {
          return {
            page: currentPath,
            title: "Dispatch Creation Is Pending",
            message: `${count} allocation${count === 1 ? "" : "s"} ${count === 1 ? "is" : "are"} ready for dispatch creation.`,
            type: "Dispatch",
            source: "reminder",
          };
        }
      }

      if (currentPath === "/deliveries") {
        const { count, error } = await supabase
          .from("v_dispatches")
          .select("dispatch_id", { count: "exact", head: true })
          .eq("status", "In Transit");

        if (error) throw error;
        if ((count || 0) > 0) {
          return {
            page: currentPath,
            title: "Delivery Confirmation Is Pending",
            message: `${count} dispatch${count === 1 ? "" : "es"} ${count === 1 ? "is" : "are"} still in transit and awaiting delivery confirmation.`,
            type: "Delivery",
            source: "reminder",
          };
        }
      }
    } catch (error) {
      console.error("Error creating page reminder:", error);
    }

    return null;
  };

  useEffect(() => {
    const handleNotification = (
      event: Event
    ) => {
      const detail = (event as CustomEvent<Omit<InAppNotification, "id">>).detail;
      const nextNotification: InAppNotification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: detail.source ?? "action",
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

  useEffect(() => {
    let cancelled = false;

    const syncPageReminder = async () => {
      const reminder = await createPageReminder(pathname);

      if (cancelled) return;

      setNotifications((current) => {
        const notificationsForOtherPages = current.filter(
          (notification) => notification.page !== pathname
        );

        if (!reminder) {
          return notificationsForOtherPages;
        }

        return [
          {
            id: `reminder-${pathname}`,
            ...reminder,
          },
          ...notificationsForOtherPages,
        ].slice(0, 10);
      });

      if (reminder) {
        setIsNotificationOpen(true);
      }
    };

    void syncPageReminder();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const syncGlobalEmergencyAlert = async () => {
      const alert = await createGlobalEmergencyAlert();

      if (cancelled) return;

      setGlobalEmergencyAlert(alert);
    };

    void syncGlobalEmergencyAlert();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

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
        <TopNav
          activeNotification={activeNotification}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
