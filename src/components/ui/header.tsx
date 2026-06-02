"use client";

import { Moon, Sun, Database, History, Download, Upload } from "lucide-react";

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="flex h-auto min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border-default px-3 md:px-4 py-2 flex-shrink-0 select-none bg-panel">
      {/* LEFT: Logo & Title */}
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <span className="text-[13px] font-semibold tracking-tight text-primary">
          Query Builder
        </span>
      </div>

      {/* CENTER: Navigation Toolbar */}
      <nav className="flex items-center gap-0.5 rounded-lg p-0.5 bg-secondary overflow-x-auto max-w-full scrollbar-none">
        <NavButton
          icon={<Database size={13} />}
          label="Schema"
          shortcut="1"
          active
        />
        <NavButton icon={<History size={13} />} label="History" shortcut="2" />
        <NavButton icon={<Download size={13} />} label="Export" shortcut="3" />
        <NavButton icon={<Upload size={13} />} label="Import" shortcut="4" />
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
}: {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  active?: boolean;
}) {
  return (
    <button
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
