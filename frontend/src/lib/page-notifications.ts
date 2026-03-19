"use client";

export interface InAppNotification {
  id: string;
  page: string;
  title: string;
  message: string;
  type: "Alert" | "Request" | "Dispatch" | "Delivery" | "Info";
  source?: "action" | "reminder" | "guidance";
  urgent?: boolean;
}

const NOTIFICATION_EVENT = "drras:notify";

export function triggerInAppNotification(
  notification: Omit<InAppNotification, "id">
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<Omit<InAppNotification, "id">>(NOTIFICATION_EVENT, {
      detail: notification,
    })
  );
}

export { NOTIFICATION_EVENT };
