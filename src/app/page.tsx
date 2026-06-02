"use client";

import { useEffect } from "react";
import { useQueryStore } from "@/store/query-store";
import { Header } from "@/components/ui/header";
import { Layers, Play } from "lucide-react";
import { SchemaPanel } from "@/components/query-builder/schema-panel";
import { QueryWorkspace } from "@/components/query-builder/query-workspace";

export default function Home() {
  const { currentQuery, initializeQuery, isDarkMode, toggleDarkMode } =
    useQueryStore();

  useEffect(() => {
    if (!currentQuery) {
      initializeQuery();
    }
  }, [currentQuery, initializeQuery]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Schema Explorer */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col overflow-hidden bg-panel border-r border-border-secondary">
          <SchemaPanel />
        </div>

        {/* Center Panel - Query Builder */}
        {/* <Panel title={null} width="flex-1" borderSide={null}>
          <CenterEmptyState />
        </Panel> */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <QueryWorkspace />
        </div>

        {/* Right Panel - Results */}
        <Panel
          title="Results"
          icon={<Play size={14} />}
          width="w-full lg:w-96"
          borderSide="border-l"
        >
          <EmptyState
            icon={<Play size={20} />}
            title="Run a Query"
            description="Build a query and execute it to see matching results here."
            action={{
              label: "Execute Query",
              onClick: () => {
                const store = useQueryStore.getState();
                store.executeCurrentQuery();
              },
            }}
          />
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
      className={`${width} flex flex-col overflow-hidden bg-panel ${borderSide || ""} ${borderSide ? "border-border-secondary" : ""}`}
    >
      {title && (
        <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
          <span className="text-muted">{icon}</span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            {title}
          </h2>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex w-full max-w-[240px] flex-col items-center gap-4 rounded-2xl border border-border-secondary bg-elevated px-6 py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted">
          {icon}
        </div>
        <div>
          <p className="text-[13px] font-medium text-primary">{title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            {description}
          </p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-accent-foreground transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CENTER EMPTY STATE
// ============================================================

// function CenterEmptyState() {
//   return (
//     <div className="flex h-full items-center justify-center bg-secondary p-8">
//       <div className="flex w-full max-w-[540px] flex-col items-center gap-4 rounded-[20px] border border-border-secondary bg-elevated px-8 py-8 text-center">
//         <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-border bg-accent-surface">
//           <svg
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M4 6h16M4 12h10M4 18h6"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               className="text-accent"
//             />
//             <circle
//               cx="18"
//               cy="18"
//               r="3"
//               stroke="currentColor"
//               strokeWidth="2"
//               className="text-accent"
//             />
//             <path
//               d="M18 16v4M16 18h4"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               className="text-accent"
//             />
//           </svg>
//         </div>
//         <div>
//           <h2 className="text-[15px] font-semibold text-primary">
//             Start Building a Query
//           </h2>
//           <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
//             Select a table from the schema explorer and add conditions to build
//             your query visually.
//           </p>
//         </div>
//         <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-muted">
//           <FlowStep>Table</FlowStep>
//           <FlowChevron />
//           <FlowStep>Fields</FlowStep>
//           <FlowChevron />
//           <FlowStep>Filters</FlowStep>
//           <FlowChevron />
//           <FlowStep>Sort</FlowStep>
//           <FlowChevron />
//           <FlowStep accent>Results</FlowStep>
//         </div>
//       </div>
//     </div>
//   );
// }

// function FlowStep({
//   children,
//   accent,
// }: {
//   children: React.ReactNode;
//   accent?: boolean;
// }) {
//   return (
//     <span
//       className={`rounded-md px-2 py-1 ${
//         accent
//           ? "bg-accent-surface text-accent border border-accent-border"
//           : "bg-secondary text-muted"
//       }`}
//     >
//       {children}
//     </span>
//   );
// }

// function FlowChevron() {
//   return (
//     <svg
//       width="12"
//       height="12"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       opacity="0.4"
//     >
//       <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }
