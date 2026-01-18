"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
