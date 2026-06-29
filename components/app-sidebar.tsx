"use client";

import { AsciiControlsPanel } from "@/components/ascii/controls-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { AsciiParameters } from "@/hooks/use-ascii";

interface AppSidebarProps {
  uploadedImage: File | null;
  parameters: AsciiParameters;
  renderDimensions?: { width: number; height: number } | null;
  onParametersChange: (params: Partial<AsciiParameters>) => void;
}

export function AppSidebar({
  uploadedImage,
  parameters,
  renderDimensions,
  onParametersChange,
}: AppSidebarProps) {
  return (
    <Sidebar mobileVariant="none" variant="inset">
      <SidebarHeader className="hidden px-2 md:flex">
        <h1
          className="font-bold text-xl tracking-tight md:text-2xl"
          style={{ textWrap: "balance" }}
        >
          ASCII
        </h1>
        <p className="text-sm leading-[1.6]" style={{ textWrap: "pretty" }}>
          Apply high-quality ASCII rendering to your images
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="py-3">
            <AsciiControlsPanel
              disabled={!uploadedImage}
              onParametersChange={onParametersChange}
              parameters={parameters}
              renderDimensions={renderDimensions}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="hidden px-2 text-muted-foreground text-xs md:flex">
        <p style={{ textWrap: "pretty" }}>
          Made by{" "}
          <a
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="https://matthewblode.com"
            rel="noopener"
            target="_blank"
          >
            Matthew Blode
          </a>{" "}
          with{" "}
          <a
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="https://ui.blode.co"
            rel="noopener"
            target="_blank"
          >
            Blode UI
          </a>
          .
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
