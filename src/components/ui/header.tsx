"use client";

import { Moon, Sun, Database, History, Download, Upload } from "lucide-react";
import { useQueryStore } from "@/store/query-store";
import { useCallback, useEffect } from "react";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  //   const exportQuery = useQueryStore((state) => state.exportQuery);
  const importQuery = useQueryStore((state) => state.importQuery);

  const results = useQueryStore((state) => state.results);

  const historyMode = useQueryStore((state) => state.historyMode);
  const setHistoryMode = useQueryStore((state) => state.setHistoryMode);

  const handleSchemaClick = () => {
    setHistoryMode(false);
  };

  const handleHistoryClick = () => {
    setHistoryMode(true);
  };

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleExport = useCallback(() => {
    if (results && results.length > 0) {
      const headers = Object.keys(results[0]).join(",");
      const rows = results.map((row) =>
        Object.values(row)
          .map((val) => {
            const str = String(val ?? "");
            return str.includes(",") || str.includes('"')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(","),
      );
      const csv = [headers, ...rows].join("\n");
      downloadFile(csv, "query-results.csv", "text/csv");
      return;
    }
    const query = useQueryStore.getState().currentQuery;
    if (query) {
      const json = JSON.stringify(query, null, 2);
      downloadFile(json, "query-export.json", "application/json");
    }
  }, [results]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const success = importQuery(text);
        if (!success) {
          alert("Invalid query file. Please check the format and try again.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - toggle history/schema
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setHistoryMode(!historyMode);
      }
      // Ctrl/Cmd + 1 - Schema
      if ((e.metaKey || e.ctrlKey) && e.key === "1") {
        e.preventDefault();
        setHistoryMode(false);
      }
      // Ctrl/Cmd + 2 - History
      if ((e.metaKey || e.ctrlKey) && e.key === "2") {
        e.preventDefault();
        setHistoryMode(true);
      }
      // Ctrl/Cmd + E - Export
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleExport();
      }
      // Ctrl/Cmd + I - Import
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        handleImport();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyMode, results, handleExport, handleImport, setHistoryMode]);

  return (
    <header className="flex h-auto min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border-default px-3 md:px-4 py-2 flex-shrink-0 select-none bg-panel">
      {/* LEFT: Logo & Title */}
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <span className="text-[13px] font-semibold tracking-widest text-primary uppercase">
          Query Builder
        </span>
      </div>

      {/* CENTER: Navigation Toolbar */}
      <nav className="flex items-center gap-0.5 rounded-lg p-0.5 bg-secondary overflow-x-auto max-w-full scrollbar-none">
        <NavButton
          icon={<Database size={13} />}
          label="Schema"
          shortcut="1"
          active={!historyMode}
          onClick={handleSchemaClick}
        />
        <NavButton
          icon={<History size={13} />}
          label="History"
          shortcut="2"
          active={historyMode}
          onClick={handleHistoryClick}
        />
        <NavButton
          icon={<Upload size={13} />}
          label="Export"
          shortcut="e"
          onClick={handleExport}
        />
        <NavButton
          icon={<Download size={13} />}
          label="Import"
          shortcut="i"
          onClick={handleImport}
        />
      </nav>

      {/* RIGHT: Theme Toggle - renders both icons, shows one via CSS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDarkMode}
          className="cursor-pointer relative flex h-7 w-7 items-center justify-center rounded-md bg-secondary transition-all duration-150 hover:brightness-95"
          aria-label="Toggle theme"
          data-testid="theme-toggle"
        >
          {/* Sun - visible in dark mode (when user wants to switch to light) */}
          <Sun
            size={14}
            className={`absolute text-secondary-text transition-opacity duration-150 ${
              isDarkMode ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Moon - visible in light mode (when user wants to switch to dark) */}
          <Moon
            size={14}
            className={`absolute text-secondary-text transition-opacity duration-150 ${
              isDarkMode ? "opacity-0" : "opacity-100"
            }`}
          />
        </button>
      </div>
    </header>
  );
}

// ============================================================
// LOGO MARK
// ============================================================

function LogoMark() {
  return (
    <div className="relative flex h-7 w-7 items-center justify-center">
      <div className="absolute inset-0 rounded-md bg-[radial-gradient(circle,rgba(22,163,74,0.25)_0%,transparent_70%)] blur-[3px]" />
      <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-accent shadow-[0_0_10px_rgba(22,163,74,0.3)]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="3" fill="white" />
          <path
            d="M12 9V4M12 20v-5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M9 12H4M20 12h-5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}

// ============================================================
// NAVIGATION BUTTON
// ============================================================

function NavButton({
  icon,
  label,
  shortcut,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all duration-150 ${
        active
          ? "bg-accent-surface border border-accent-border text-accent shadow-none"
          : "text-secondary-text hover:bg-hover"
      }`}
    >
      {icon}
      {label}
      <kbd
        className={`hidden md:inline-flex text-[10px] font-medium px-1 rounded font-mono ${
          active ? "text-accent/70" : "text-muted"
        }`}
      >
        ⌘{shortcut}
      </kbd>
    </button>
  );
}
