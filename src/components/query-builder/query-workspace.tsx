"use client";

import { useQueryStore } from "@/store/query-store";
import { Plus, Trash2, ChevronRight, GripVertical } from "lucide-react";
import { Operator } from "@/types";
import { operatorLabels } from "@/lib/operators";

export function QueryWorkspace() {
  const currentQuery = useQueryStore((state) => state.currentQuery);
  const schemaLoaded = useQueryStore((state) => state.schemaLoaded);
  const queryPreview = useQueryStore((state) => state.queryPreview);

  if (!schemaLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-secondary p-8">
        <div className="flex w-full max-w-[540px] flex-col items-center gap-4 rounded-[20px] border border-border-secondary bg-elevated px-8 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-border bg-accent-surface">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6h16M4 12h10M4 18h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-accent"
              />
              <circle
                cx="18"
                cy="18"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                className="text-accent"
              />
              <path
                d="M18 16v4M16 18h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-accent"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-primary">
              Start Building a Query
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Load a schema first, then add conditions to build your query
              visually.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuery) return null;

  return (
    <section className="flex h-full flex-col overflow-hidden bg-secondary">
      {/* Query Builder Header */}
      <div className="flex items-center justify-between border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Query Builder
          </h2>
          <span className="text-[11px] text-muted font-mono">
            {currentQuery.schemaName}
          </span>
        </div>
      </div>

      {/* Query Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        <GroupNode group={currentQuery.rootGroup} isRoot />
      </div>

      {/* Query Preview Bar */}
      <div className="border-t border-border-secondary flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted font-condensed">
            Preview
          </span>
          <code className="flex-1 text-[12px] text-primary font-mono whitespace-pre-wrap">
            {queryPreview || "No conditions yet"}
          </code>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// GROUP NODE - Recursive component
// ============================================================

interface GroupNodeProps {
  group: {
    id: string;
    logicalOperator: string;
    children: Array<{
      id: string;
      type: string;
      field?: string;
      operator?: string;
      value?: unknown;
      logicalOperator?: string;
      children?: Array<unknown>;
    }>;
  };
  isRoot?: boolean;
}

function GroupNode({ group, isRoot = false }: GroupNodeProps) {
  const updateLogicalOperator = useQueryStore(
    (state) => state.updateLogicalOperator,
  );
  const addCondition = useQueryStore((state) => state.addCondition);
  const addGroup = useQueryStore((state) => state.addGroup);
  const removeNode = useQueryStore((state) => state.removeNode);

  return (
    <div
      className={`${isRoot ? "" : "ml-4 border-l-2 border-border-secondary pl-3"}`}
    >
      {/* Group Header - shown for nested groups */}
      {!isRoot && (
        <div className="flex items-center gap-1.5 mb-2">
          {/* Collapse/Expand chevron */}
          <button className="cursor-pointer rounded p-0.5 text-muted hover:text-secondary-text transition-colors duration-150">
            <ChevronRight
              size={12}
              className="transition-transform duration-150"
            />
          </button>

          {/* AND/OR Toggle */}
          <button
            onClick={() =>
              updateLogicalOperator(
                group.id,
                group.logicalOperator === "AND" ? "OR" : "AND",
              )
            }
            className={`cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider font-condensed transition-all duration-150 ${
              group.logicalOperator === "AND"
                ? "bg-accent-surface text-accent border border-accent-border"
                : "bg-accent-50 text-accent-700 border border-accent-200"
            }`}
          >
            {group.logicalOperator}
          </button>

          {/* Remove group */}
          <button
            onClick={() => removeNode(group.id)}
            className="cursor-pointer rounded p-0.5 text-muted hover:text-danger transition-colors duration-150"
            data-testid="remove-group"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Children */}
      <div className="space-y-1.5">
        {group.children.map((child) => {
          if (child.type === "condition") {
            return (
              <div key={child.id} className="flex items-center gap-1">
                {/* Drag handle for reordering */}
                <div className="cursor-grab text-muted hover:text-secondary-text transition-colors duration-150 flex-shrink-0">
                  <GripVertical size={12} />
                </div>
                <ConditionNode
                  condition={{
                    id: child.id,
                    field: child.field || "",
                    operator: child.operator || "equals",
                    value: child.value || "",
                  }}
                />
              </div>
            );
          }
          return (
            <GroupNode
              key={child.id}
              group={
                child as {
                  id: string;
                  logicalOperator: string;
                  children: Array<{
                    id: string;
                    type: string;
                    field?: string;
                    operator?: string;
                    value?: unknown;
                    logicalOperator?: string;
                    children?: Array<unknown>;
                  }>;
                }
              }
            />
          );
        })}
      </div>

      {/* Add Buttons */}
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={() => addCondition(group.id)}
          className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted hover:text-primary hover:bg-hover transition-all duration-150 font-condensed"
          data-testid="add-condition"
        >
          <Plus size={12} />
          Condition
        </button>
        <button
          onClick={() => addGroup(group.id)}
          className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted hover:text-primary hover:bg-hover transition-all duration-150 font-condensed"
          data-testid="add-group"
        >
          <Plus size={12} />
          Group
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CONDITION NODE
// ============================================================

interface ConditionNodeProps {
  condition: {
    id: string;
    field: string;
    operator: string;
    value: unknown;
  };
}

function ConditionNode({ condition }: ConditionNodeProps) {
  const schema = useQueryStore((state) => state.schema);
  const updateCondition = useQueryStore((state) => state.updateCondition);
  const removeNode = useQueryStore((state) => state.removeNode);

  // Find the field definition to show type-aware UI
  const fieldDef = schema.find((f) => f.name === condition.field);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-panel border border-border-secondary px-3 py-2 animate-fade-in flex-1">
      {/* Field Select */}
      <select
        value={condition.field}
        onChange={(e) =>
          updateCondition(condition.id, { field: e.target.value })
        }
        className="cursor-pointer bg-transparent text-[12px] font-medium text-secondary-text outline-none font-sans min-w-0 max-w-[120px]"
        data-testid="condition-field"
      >
        <option value="" className="text-muted">
          Field
        </option>
        {schema.map((f) => (
          <option key={f.name} value={f.name}>
            {f.label || f.name}
          </option>
        ))}
      </select>

      {/* Operator Select */}
      <select
        value={condition.operator}
        onChange={(e) =>
          updateCondition(condition.id, {
            operator: e.target.value as Operator,
          })
        }
        className="cursor-pointer bg-transparent text-[12px] text-secondary-text outline-none font-mono min-w-0 max-w-[110px]"
        data-testid="condition-operator"
      >
        <option value="equals">{operatorLabels.equals}</option>
        <option value="notEquals">{operatorLabels.notEquals}</option>
        <option value="greaterThan">{operatorLabels.greaterThan}</option>
        <option value="lessThan">{operatorLabels.lessThan}</option>
        <option value="contains">{operatorLabels.contains}</option>
        <option value="startsWith">{operatorLabels.startsWith}</option>
        <option value="in">{operatorLabels.in}</option>
        <option value="between">{operatorLabels.between}</option>
        <option value="isNull">{operatorLabels.isNull}</option>
        <option value="isNotNull">{operatorLabels.isNotNull}</option>
      </select>

      {/* Value Input */}
      <input
        type="text"
        value={(condition.value as string) || ""}
        onChange={(e) =>
          updateCondition(condition.id, { value: e.target.value })
        }
        placeholder="value"
        className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary placeholder:text-muted outline-none font-mono min-w-[60px]"
        data-testid="condition-value"
      />

      {/* Field type badge (uses fieldDef) */}
      {fieldDef && (
        <span className="text-[10px] text-muted font-mono flex-shrink-0 hidden sm:inline">
          {fieldDef.type}
        </span>
      )}

      {/* Remove */}
      <button
        onClick={() => removeNode(condition.id)}
        className="cursor-pointer flex-shrink-0 rounded p-1 text-muted hover:text-danger transition-colors duration-150"
        data-testid="remove-condition"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
