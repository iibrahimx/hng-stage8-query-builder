"use client";

import { History, Clock, Trash2, Upload } from "lucide-react";
import { useQueryStore } from "@/store/query-store";

export function HistoryPanel() {
  const queryHistory = useQueryStore((state) => state.queryHistory);
  const savedPresets = useQueryStore((state) => state.savedPresets);
  //   const loadPreset = useQueryStore((state) => state.loadPreset);
  const deletePreset = useQueryStore((state) => state.deletePreset);
  // Merge both arrays, presets first (they're user-named), history second
  const allEntries = [...savedPresets, ...queryHistory].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );

  return (
    <section className="flex h-full flex-col overflow-hidden bg-secondary">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
        <History size={13} className="text-muted" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
          Query History
        </h2>
        {queryHistory.length > 0 && (
          <span className="ml-auto text-[11px] text-muted font-mono">
            {allEntries.length} saved
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {allEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-elevated text-muted border border-border-secondary">
              <Clock size={20} />
            </div>
            <p className="text-[13px] font-medium text-primary">
              No Query History
            </p>
            <p className="text-[12px] leading-relaxed text-muted">
              Executed queries will appear here for quick access.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg bg-panel border border-border-secondary px-3 py-2.5 hover:bg-hover transition-colors duration-100 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-primary truncate font-sans">
                    {entry.name}
                  </p>
                  <p className="text-[11px] text-muted font-mono mt-0.5">
                    {new Date(entry.savedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => {
                      const json = JSON.stringify(entry.query, null, 2);
                      const blob = new Blob([json], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${entry.name.replace(/\s+/g, "-").toLowerCase()}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="cursor-pointer rounded p-1.5 text-muted hover:text-accent hover:bg-accent-surface transition-colors duration-150"
                    title="Export this query as JSON"
                  >
                    <Upload size={13} />
                  </button>
                  <button
                    onClick={() => deletePreset(entry.id)}
                    className="cursor-pointer rounded p-1.5 text-muted hover:text-danger hover:bg-danger-surface transition-colors duration-150"
                    title="Delete from history"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
