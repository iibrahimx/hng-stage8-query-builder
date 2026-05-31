"use client";

import { useEffect } from "react";
import { useQueryStore } from "@/store/query-store";
import { Header } from "@/components/ui/header";
import { Layers, Play } from "lucide-react";

export default function Home() {
  const { currentQuery, initializeQuery, isDarkMode, toggleDarkMode } =
    useQueryStore();

  // Initialize a fresh query when the app first loads
  useEffect(() => {
    if (!currentQuery) {
      initializeQuery();
    }
  }, [currentQuery, initializeQuery]);

  // Sync dark mode class with the HTML element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <Panel
          title="Schema Explorer"
          icon={<Layers size={14} />}
          width="w-72"
          borderSide="border-r"
        >
          <PanelPlaceholder>Schema panel (coming next)</PanelPlaceholder>
        </Panel>

        {/* Center Panel */}
        <Panel title={null} width="flex-1" borderSide={null}>
          <PanelPlaceholder>Query Builder (coming next)</PanelPlaceholder>
        </Panel>

        {/* Right Panel */}
        <Panel
          title="Results"
          icon={<Play size={14} />}
          width="w-96"
          borderSide="border-l"
        >
          <PanelPlaceholder>Results panel (coming next)</PanelPlaceholder>
        </Panel>
      </main>
    </div>
  );
}

// ============================================================
// PANEL COMPONENT
// ============================================================

function Panel({
  title,
  icon,
  width,
  borderSide,
  children,
}: {
  title: string | null;
  icon?: React.ReactNode;
  width: string;
  borderSide: "border-r" | "border-l" | null;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={`${width} flex-shrink-0 flex flex-col overflow-hidden ${borderSide || ""}`}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border-light)",
      }}
    >
      {/* Panel Header */}
      {title && (
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ borderColor: "var(--color-border-light)" }}
        >
          <span style={{ color: "var(--color-text-muted)" }}>{icon}</span>
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-condensed)",
              color: "var(--color-text-secondary)",
            }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

// ============================================================
// PLACEHOLDER (temporary)
// ============================================================

function PanelPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p
        className="text-xs"
        style={{
          fontFamily: "var(--font-condensed)",
          color: "var(--color-text-muted)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
