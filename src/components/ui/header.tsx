"use client";

import { Sun, Moon, Database, History, Download, Upload } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header
      className="flex h-14 items-center justify-between border-b px-6 flex-shrink-0 z-10"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border-light)",
      }}
    >
      {/* ========== LEFT: Logo & Title ========== */}
      <div className="flex items-center gap-3">
        {/* Professional Logo Mark */}
        <LogoMark />

        {/* Title */}
        <div className="flex flex-col">
          <h1
            className="text-sm font-semibold tracking-tight leading-none"
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--color-text-primary)",
            }}
          >
            Query Builder
          </h1>
          <span
            className="text-[10px] font-medium tracking-wider uppercase leading-none mt-0.5"
            style={{
              fontFamily: "var(--font-condensed)",
              color: "var(--color-text-muted)",
            }}
          >
            Visual Explorer
          </span>
        </div>
      </div>

      {/* ========== CENTER: Quick Actions ========== */}
      <div className="flex items-center gap-1">
        <QuickActionButton
          icon={<Database size={16} />}
          label="Schema"
          data-testid="schema-btn"
        />
        <QuickActionButton
          icon={<History size={16} />}
          label="History"
          data-testid="history-btn"
        />
        <QuickActionButton
          icon={<Download size={16} />}
          label="Export"
          data-testid="export-btn"
        />
        <QuickActionButton
          icon={<Upload size={16} />}
          label="Import"
          data-testid="import-btn"
        />
      </div>

      {/* ========== RIGHT: Theme Toggle ========== */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="relative rounded-lg p-2 transition-all duration-200 hover:bg-opacity-10 cursor-pointer"
          style={{
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-surface-100)",
          }}
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
          data-testid="theme-toggle"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
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
    <div className="relative flex h-9 w-9 items-center justify-center">
      {/* Glow ring - pulses outward */}
      <div
        className="absolute inset-0 rounded-lg animate-pulse"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)",
          opacity: 0.3,
          filter: "blur(4px)",
        }}
      />

      {/* Main logo background */}
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-lg z-10"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-500) 100%)",
          boxShadow:
            "0 0 12px rgba(21, 128, 61, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Accent corner highlight */}
        <div
          className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--color-accent-400)" }}
        />

        {/* Logo symbol */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="3" fill="white" />
          <path
            d="M12 9V4M12 20v-5M9 12H4M20 12h-5M7.05 7.05L3.5 3.5M20.5 20.5l-3.55-3.55M16.95 7.05l3.55-3.55M3.5 20.5l3.55-3.55"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="12" cy="3" r="1.2" fill="var(--color-accent-300)" />
          <circle cx="12" cy="21" r="1.2" fill="var(--color-accent-300)" />
          <circle cx="3" cy="12" r="1.2" fill="var(--color-accent-300)" />
          <circle cx="21" cy="12" r="1.2" fill="var(--color-accent-300)" />
          <circle cx="4.5" cy="4.5" r="1" fill="var(--color-accent-300)" />
          <circle cx="19.5" cy="19.5" r="1" fill="var(--color-accent-300)" />
          <circle cx="19.5" cy="4.5" r="1" fill="var(--color-accent-300)" />
          <circle cx="4.5" cy="19.5" r="1" fill="var(--color-accent-300)" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================
// QUICK ACTION BUTTON
// ============================================================

function QuickActionButton({
  icon,
  label,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  [key: string]: unknown;
}) {
  return (
    <button
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all 
        duration-150 hover:brightness-95 cursor-pointer"
      style={{
        fontFamily: "var(--font-condensed)",
        color: "var(--color-text-secondary)",
        backgroundColor: "transparent",
      }}
      {...props}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
