"use client";

import { useState } from "react";
import { Layers, Search, Database } from "lucide-react";
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
  number: "text-gold bg-accent-50 dark:text-accent-400 dark:bg-accent-900/30",
  enum: "text-danger bg-danger-surface",
  date: "text-accent bg-accent-surface",
  boolean: "text-muted bg-secondary",
};

export function SchemaPanel() {
  const schema = useQueryStore((state) => state.schema);
  const schemaLoaded = useQueryStore((state) => state.schemaLoaded);
  const loadSchema = useQueryStore((state) => state.loadSchema);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter fields based on search
  const filteredFields = schema.filter((field) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const label = (field.label || field.name).toLowerCase();
    const name = field.name.toLowerCase();
    const type = field.type.toLowerCase();
    return (
      label.includes(query) || name.includes(query) || type.includes(query)
    );
  });

  // EMPTY STATE: Schema not loaded yet
  if (!schemaLoaded) {
    return (
      <aside className="flex h-full flex-col overflow-hidden bg-panel">
        <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
          <Layers size={13} className="text-muted" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Schema Explorer
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex w-full max-w-[220px] flex-col items-center gap-4 rounded-2xl border border-border-secondary bg-elevated px-5 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted">
              <Database size={20} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-primary">
                Connect a Schema
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Load the users schema to begin exploring available fields.
              </p>
            </div>
            <button
              onClick={loadSchema}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-[12px] font-semibold text-accent-foreground transition-all duration-150 hover:bg-accent-hover active:scale-[0.98]"
            >
              Load Schema
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // LOADED STATE: Show fields
  return (
    <aside className="flex h-full flex-col overflow-hidden bg-panel">
      {/* Panel Header */}
      <div className="flex items-center gap-2 border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
        <Layers size={13} className="text-muted" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
          Schema Explorer
        </h2>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <SchemaTab name="users" />
            <SchemaTab name="products" />
            <SchemaTab name="orders" />
            <SchemaTab name="workers" />
            <SchemaTab name="cities" />
          </div>
        </div>
        <span className="ml-auto text-[11px] text-muted font-mono">
          {filteredFields.length}/{schema.length}
        </span>
      </div>

      {/* Search */}
      <div className="border-b border-border-secondary px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
          <Search size={13} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[12px] text-primary placeholder:text-muted outline-none font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="cursor-pointer text-muted hover:text-secondary-text flex-shrink-0"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredFields.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[12px] text-muted">
              No fields match your search
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredFields.map((field) => (
              <SchemaField key={field.name} field={field} />
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border-secondary px-4 py-2">
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
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-150 hover:bg-hover group cursor-pointer active:scale-[0.99]"
      data-testid={`schema-field-${field.name}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-primary truncate font-sans">
          {label}
        </p>
        <p className="text-[11px] text-muted font-mono truncate">
          {field.name}
        </p>
      </div>

      <span
        className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-condensed ${colors}`}
      >
        {typeLabels[field.type]}
      </span>

      {field.options && field.options.length > 0 && (
        <span className="text-[10px] text-muted font-mono flex-shrink-0 hidden group-hover:inline">
          {field.options.length} values
        </span>
      )}
    </button>
  );
}

// ============================================================
// SCHEMA TAB COMPONENT
// ============================================================

function SchemaTab({
  name,
}: {
  name: "users" | "products" | "orders" | "workers" | "cities";
}) {
  const activeSchema = useQueryStore((state) => state.activeSchema);
  const switchSchema = useQueryStore((state) => state.switchSchema);

  return (
    <button
      onClick={() => switchSchema(name)}
      className={`cursor-pointer rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-condensed transition-all duration-150 ${
        activeSchema === name
          ? "bg-accent-surface text-accent border border-accent-border"
          : "text-muted hover:text-secondary-text hover:bg-hover"
      }`}
    >
      {name}
    </button>
  );
}
