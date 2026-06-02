"use client";

import { Play, Loader2, FileText } from "lucide-react";
import { useQueryStore } from "@/store/query-store";

export function ResultsPanel() {
  const results = useQueryStore((state) => state.results);
  const resultCount = useQueryStore((state) => state.resultCount);
  const isExecuting = useQueryStore((state) => state.isExecuting);
  const executeCurrentQuery = useQueryStore(
    (state) => state.executeCurrentQuery,
  );
  const clearResults = useQueryStore((state) => state.clearResults);
  const currentQuery = useQueryStore((state) => state.currentQuery);

  const hasQuery = currentQuery && currentQuery.rootGroup.children.length > 0;
  const hasResults = results && results.length > 0;

  const hasExecuted = useQueryStore((state) => state.hasExecuted);

  return (
    <aside className="flex w-full h-full flex-col overflow-hidden bg-panel">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
        <Play size={13} className="text-muted" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
          Results
        </h2>
        {hasResults && (
          <span className="ml-auto text-[11px] text-muted font-mono">
            {resultCount} row{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isExecuting && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <Loader2 size={24} className="animate-spin text-accent" />
            <p className="text-[13px] text-muted">Executing query...</p>
          </div>
        )}

        {/* Results Table */}
        {!isExecuting && hasResults && (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left min-w-full">
              <thead className="sticky top-0 bg-panel z-10">
                <tr className="border-b border-border-secondary">
                  {Object.keys(results[0]).map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted font-condensed whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border-light hover:bg-hover transition-colors duration-100"
                  >
                    {Object.values(row).map((val, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-3 py-2 text-[12px] text-primary font-mono"
                      >
                        {formatCellValue(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State - No query built */}
        {!isExecuting && !hasQuery && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted">
              <FileText size={20} />
            </div>
            <p className="text-[13px] font-medium text-primary">
              Build a Query First
            </p>
            <p className="text-[12px] leading-relaxed text-muted">
              Add conditions in the query builder, then execute to see results.
            </p>
          </div>
        )}

        {/* Empty State - Executed but no results */}
        {!isExecuting && hasExecuted && !hasResults && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-surface text-danger">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-primary">
              No Results Found
            </p>
            <p className="text-[12px] leading-relaxed text-muted">
              Your query ran successfully but returned no matching records. Try
              adjusting your conditions.
            </p>
          </div>
        )}

        {/* Empty State - Has query but not executed */}
        {!isExecuting && hasQuery && !hasExecuted && !hasResults && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted">
              <Play size={20} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-primary">
                Execute Your Query
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Your query is ready. Run it to preview matching results.
              </p>
            </div>
            <button
              onClick={executeCurrentQuery}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-accent-foreground transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]"
            >
              Execute Query
            </button>
          </div>
        )}

        {/* Has results - show Run Again and Clear buttons */}
        {!isExecuting && hasResults && (
          <div className="flex items-center justify-between border-t border-border-secondary px-4 py-2.5">
            <button
              onClick={executeCurrentQuery}
              className="cursor-pointer flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium text-muted hover:text-primary hover:bg-hover transition-all duration-150 font-condensed"
            >
              <Play size={12} />
              Run Again
            </button>
            <button
              onClick={clearResults}
              className="cursor-pointer flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium text-muted hover:text-danger hover:bg-danger-surface transition-all duration-150 font-condensed"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}
