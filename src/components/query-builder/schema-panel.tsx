"use client";

import { Layers, Search } from "lucide-react";
import { useQueryStore } from "@/store/query-store";
import { FieldType } from "@/types";

// Maps field types to human-readable labels
const typeLabels: Record<FieldType, string> = {
  string: "Text",
  number: "Number",
  enum: "Enum",
  date: "Date",
  boolean: "True/False",
};

// Color coding for field type badges
const typeColors: Record<FieldType, string> = {
  string:
    "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30",
  number: "text-gold bg-accent-50 dark:text-accent-500 dark:bg-accent-900/15",
  enum: "text-danger bg-danger-surface",
  date: "text-accent bg-accent-surface",
  boolean: "text-muted bg-secondary",
};

export function SchemaPanel() {
  const schema = useQueryStore((state) => state.schema);

  return (
    <aside className="flex h-full flex-col overflow-hidden bg-panel">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
        <Layers size={13} className="text-muted" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
          Schema Explorer
        </h2>
        <span className="ml-auto text-[11px] text-muted font-mono">
          {schema.length} fields
        </span>
      </div>

      {/* Search */}
      <div className="border-b border-border-secondary px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-secondary border border-border-secondary px-3 py-1.5">
          <Search size={13} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search fields..."
            className="flex-1 bg-transparent text-[12px] text-primary placeholder:text-muted outline-none font-sans"
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {schema.map((field) => (
            <SchemaField key={field.name} field={field} />
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t border-border-secondary bg-secondary px-4 py-2">
        <p className="text-[11px] text-muted">
          Click a field to add it to your query
        </p>
      </div>
    </aside>
  );
}

// ============================================================
// SINGLE SCHEMA FIELD
// ============================================================

function SchemaField({
  field,
}: {
  field: { name: string; type: FieldType; label?: string; options?: string[] };
}) {
  const label = field.label || field.name;
  const colors = typeColors[field.type] || "text-muted bg-secondary";

  return (
    <button
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left 
        transition-all duration-150 hover:bg-hover group cursor-pointer"
      data-testid={`schema-field-${field.name}`}
    >
      {/* Field name */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-primary truncate font-sans">
          {label}
        </p>
        <p className="text-[11px] text-muted font-mono truncate">
          {field.name}
        </p>
      </div>

      {/* Type badge */}
      <span
        className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-condensed ${colors}`}
      >
        {typeLabels[field.type]}
      </span>

      {/* Options indicator for enums */}
      {field.options && field.options.length > 0 && (
        <span className="text-[10px] text-muted font-mono flex-shrink-0 hidden group-hover:inline">
          {field.options.length} values
        </span>
      )}
    </button>
  );
}
