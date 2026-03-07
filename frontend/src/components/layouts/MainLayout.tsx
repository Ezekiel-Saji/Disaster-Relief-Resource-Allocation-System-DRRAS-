"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layouts/Sidebar";
import { TopNav } from "@/components/layouts/TopNav";
import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

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
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
