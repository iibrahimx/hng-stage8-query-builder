"use client";

import { useState } from "react";
import { useQueryStore } from "@/store/query-store";
import { Plus, Trash2, ChevronRight, GripVertical, Save } from "lucide-react";
import { Operator } from "@/types";
import { operatorLabels, operatorsByFieldType } from "@/lib/operators";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function QueryWorkspace() {
  const currentQuery = useQueryStore((state) => state.currentQuery);
  const schemaLoaded = useQueryStore((state) => state.schemaLoaded);
  const queryPreview = useQueryStore((state) => state.queryPreview);
  const savePreset = useQueryStore((state) => state.savePreset);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState("");

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

  const handleSavePreset = () => {
    if (isSaving) {
      // Confirm save
      if (saveName.trim()) {
        savePreset(saveName.trim());
        setSaveName("");
        setIsSaving(false);
      }
    } else {
      setIsSaving(true);
    }
  };

  const handleCancelSave = () => {
    setSaveName("");
    setIsSaving(false);
  };

  return (
    <section className="flex h-full flex-col overflow-hidden bg-secondary">
      <div className="flex items-center justify-between border-b border-border-secondary px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
            Query Builder
          </h2>
          <span className="text-[11px] text-muted font-mono">
            {currentQuery.schemaName}
          </span>
        </div>

        {isSaving ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Preset name..."
              className="bg-secondary rounded-md px-2 py-1 text-[11px] text-primary placeholder:text-muted outline-none font-sans w-32 border border-border-secondary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePreset();
                if (e.key === "Escape") handleCancelSave();
              }}
            />
            <button
              onClick={handleSavePreset}
              className="cursor-pointer rounded px-2 py-1 text-[11px] font-medium text-accent hover:bg-accent-surface transition-all duration-150 font-condensed"
            >
              Save
            </button>
            <button
              onClick={handleCancelSave}
              className="cursor-pointer rounded px-2 py-1 text-[11px] font-medium text-muted hover:text-secondary-text transition-all duration-150 font-condensed"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleSavePreset}
            className="cursor-pointer flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-muted hover:text-accent hover:bg-accent-surface transition-all duration-150 font-condensed"
          >
            <Save size={12} />
            Save
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <GroupNode group={currentQuery.rootGroup} isRoot />
      </div>

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
// GROUP NODE
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
  const reorderChildren = useQueryStore((state) => state.reorderChildren);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = group.children.findIndex((c) => c.id === active.id);
      const newIndex = group.children.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderChildren(group.id, oldIndex, newIndex);
      }
    }
  };

  const childIds = group.children.map((c) => c.id);

  return (
    <div
      className={`${isRoot ? "" : "ml-4 border-l-2 border-border-secondary pl-3"}`}
    >
      {!isRoot && (
        <div className="flex items-center gap-1.5 mb-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="cursor-pointer rounded p-0.5 text-muted hover:text-secondary-text transition-colors duration-150"
          >
            <ChevronRight
              size={12}
              className={`transition-transform duration-150 ${isCollapsed ? "" : "rotate-90"}`}
            />
          </button>

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

          <button
            onClick={() => removeNode(group.id)}
            className="cursor-pointer rounded p-0.5 text-muted hover:text-danger transition-colors duration-150"
            data-testid="remove-group"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={childIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {group.children.map((child) => {
                  if (child.type === "condition") {
                    return (
                      <SortableCondition key={child.id} id={child.id}>
                        <ConditionNode
                          condition={{
                            id: child.id,
                            field: child.field || "",
                            operator: child.operator || "equals",
                            value: child.value || "",
                          }}
                        />
                      </SortableCondition>
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
            </SortableContext>
          </DndContext>

          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => addCondition(group.id)}
              className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted hover:text-primary hover:bg-hover transition-all duration-150 font-condensed"
              data-testid="add-condition"
            >
              <Plus size={12} /> Condition
            </button>
            <button
              onClick={() => addGroup(group.id)}
              className="cursor-pointer flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted hover:text-primary hover:bg-hover transition-all duration-150 font-condensed"
              data-testid="add-group"
            >
              <Plus size={12} /> Group
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// SORTABLE CONDITION WRAPPER
// ============================================================

function SortableCondition({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted hover:text-secondary-text transition-colors duration-150 flex-shrink-0 touch-none"
      >
        <GripVertical size={12} />
      </div>
      {children}
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
  const fieldDef = schema.find((f) => f.name === condition.field);
  const validOperators = fieldDef
    ? operatorsByFieldType[fieldDef.type]
    : (Object.keys(operatorLabels) as Operator[]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-panel border border-border-secondary px-3 py-2 animate-fade-in flex-1">
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
        {validOperators.map((op) => (
          <option key={op} value={op}>
            {operatorLabels[op]}
          </option>
        ))}
      </select>

      {/* Type-aware value input - unchanged from your current version */}
      {fieldDef?.type === "enum" && fieldDef.options ? (
        <select
          value={(condition.value as string) || ""}
          onChange={(e) =>
            updateCondition(condition.id, { value: e.target.value })
          }
          className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary outline-none font-mono min-w-[60px] cursor-pointer"
          data-testid="condition-value"
        >
          <option value="">Select...</option>
          {fieldDef.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : fieldDef?.type === "number" && condition.operator === "between" ? (
        <div className="flex items-center gap-1 flex-1 min-w-[100px]">
          <input
            type="number"
            value={
              Array.isArray(condition.value)
                ? String(condition.value[0] || "")
                : ""
            }
            onChange={(e) =>
              updateCondition(condition.id, {
                value: [
                  e.target.value,
                  Array.isArray(condition.value)
                    ? condition.value[1] || ""
                    : "",
                ],
              })
            }
            placeholder="min"
            className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary placeholder:text-muted outline-none font-mono min-w-0"
          />
          <span className="text-muted text-[11px]">and</span>
          <input
            type="number"
            value={
              Array.isArray(condition.value)
                ? String(condition.value[1] || "")
                : ""
            }
            onChange={(e) =>
              updateCondition(condition.id, {
                value: [
                  Array.isArray(condition.value)
                    ? condition.value[0] || ""
                    : "",
                  e.target.value,
                ],
              })
            }
            placeholder="max"
            className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary placeholder:text-muted outline-none font-mono min-w-0"
          />
        </div>
      ) : fieldDef?.type === "number" ? (
        <input
          type="number"
          value={(condition.value as string) || ""}
          onChange={(e) =>
            updateCondition(condition.id, { value: e.target.value })
          }
          placeholder="0"
          className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary placeholder:text-muted outline-none font-mono min-w-[60px]"
          data-testid="condition-value"
        />
      ) : fieldDef?.type === "date" ? (
        <input
          type="date"
          value={(condition.value as string) || ""}
          onChange={(e) =>
            updateCondition(condition.id, { value: e.target.value })
          }
          className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary outline-none font-mono min-w-[60px]"
          data-testid="condition-value"
        />
      ) : fieldDef?.type === "boolean" ? (
        <select
          value={(condition.value as string) || ""}
          onChange={(e) =>
            updateCondition(condition.id, { value: e.target.value === "true" })
          }
          className="flex-1 bg-secondary rounded-md px-2 py-1 text-[12px] text-primary outline-none font-mono min-w-[60px] cursor-pointer"
          data-testid="condition-value"
        >
          <option value="">Select...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
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
      )}

      {fieldDef && (
        <span className="text-[10px] text-muted font-mono flex-shrink-0 hidden sm:inline">
          {fieldDef.type}
        </span>
      )}

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
