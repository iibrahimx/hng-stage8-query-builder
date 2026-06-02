import { create } from "zustand";
import {
  Condition,
  Group,
  LogicalOperator,
  Query,
  SavedQuery,
  ValidationError,
  FieldDefinition,
} from "@/types";
import { generateId, deepClone } from "@/lib/utils";
import { executeQuery, generateQueryPreview } from "@/lib/query-engine";
import { usersSchema } from "@/data";
import { UserRecord } from "@/data";
import {
  STORAGE_KEYS,
  getStoredBoolean,
  setStoredBoolean,
} from "@/lib/storage";

// ============================================================
// STORE STATE SHAPE
// ============================================================

interface QueryState {
  // --- Data ---
  currentQuery: Query | null;
  schema: FieldDefinition[];
  dataset: UserRecord[];
  results: UserRecord[] | null;
  schemaLoaded: boolean;

  // --- UI State ---
  queryPreview: string;
  validationErrors: ValidationError[];
  isExecuting: boolean;
  resultCount: number;

  // --- History & Presets ---
  queryHistory: SavedQuery[];
  savedPresets: SavedQuery[];

  // --- Theme ---
  isDarkMode: boolean;

  // --- Actions ---
  initializeQuery: () => void;
  addCondition: (parentGroupId: string) => void;
  addGroup: (parentGroupId: string) => void;
  removeNode: (nodeId: string) => void;
  updateCondition: (
    conditionId: string,
    updates: Partial<Pick<Condition, "field" | "operator" | "value">>,
  ) => void;
  updateLogicalOperator: (groupId: string, operator: LogicalOperator) => void;
  toggleCollapse: (groupId: string) => void;
  executeCurrentQuery: () => void;
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  exportQuery: () => string;
  importQuery: (json: string) => boolean;
  toggleDarkMode: () => void;
  clearResults: () => void;
  loadSchema: () => void;
}

// ============================================================
// HELPER: Create an empty condition
// ============================================================

function createEmptyCondition(): Condition {
  return {
    id: generateId(),
    type: "condition",
    field: "",
    operator: "equals",
    value: "",
  };
}

// ============================================================
// HELPER: Create an empty group
// ============================================================

function createEmptyGroup(logicalOperator: LogicalOperator = "AND"): Group {
  return {
    id: generateId(),
    type: "group",
    logicalOperator,
    children: [createEmptyCondition()],
  };
}

// ============================================================
// HELPER: Create a fresh query
// ============================================================

function createFreshQuery(): Query {
  return {
    id: generateId(),
    name: "Untitled Query",
    schemaName: usersSchema.name,
    rootGroup: createEmptyGroup("AND"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================
// RECURSIVE HELPERS FOR IMMUTABLE TREE UPDATES
// ============================================================

/**
 * Finds and updates a node in the tree immutably.
 * Returns the updated children array.
 */
function updateNodeInTree(
  nodes: QueryNode[],
  nodeId: string,
  updater: (node: QueryNode) => QueryNode,
): QueryNode[] {
  return nodes.map((node) => {
    // Found the target node
    if (node.id === nodeId) {
      return updater(node);
    }
    // If it's a group, recurse into its children
    if (node.type === "group") {
      return {
        ...node,
        children: updateNodeInTree(node.children, nodeId, updater),
      };
    }
    // Not the target, not a group - return unchanged
    return node;
  });
}

/**
 * Removes a node from the tree immutably.
 * Returns the filtered children array.
 */
function removeNodeFromTree(nodes: QueryNode[], nodeId: string): QueryNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.type === "group") {
        return {
          ...node,
          children: removeNodeFromTree(node.children, nodeId),
        };
      }
      return node;
    });
}

// Need to import QueryNode since we use it in the helpers above
import { QueryNode } from "@/types";

// ============================================================
// THE ZUSTAND STORE
// ============================================================

export const useQueryStore = create<QueryState>((set, get) => ({
  // --- Initial State ---
  currentQuery: null,
  schema: usersSchema.fields,
  dataset: [],
  results: null,
  schemaLoaded: getStoredBoolean(STORAGE_KEYS.SCHEMA_LOADED, false),
  queryPreview: "",
  validationErrors: [],
  isExecuting: false,
  resultCount: 0,
  queryHistory: [],
  savedPresets: [],
  isDarkMode: getStoredBoolean(STORAGE_KEYS.THEME, false),

  // --- ACTION: Initialize a fresh query ---
  initializeQuery: () => {
    const newQuery = createFreshQuery();
    const preview = generateQueryPreview(
      newQuery.rootGroup,
      newQuery.schemaName,
    );
    set({
      currentQuery: newQuery,
      queryPreview: preview,
      results: null,
      validationErrors: [],
    });
  },

  // --- ACTION: Add a condition to a group ---
  addCondition: (parentGroupId: string) => {
    const { currentQuery } = get();
    if (!currentQuery) return;

    const newCondition = createEmptyCondition();
    const updatedChildren = updateNodeInTree(
      currentQuery.rootGroup.children,
      parentGroupId,
      (node) => {
        if (node.type === "group") {
          return {
            ...node,
            children: [...node.children, newCondition],
          };
        }
        return node;
      },
    );

    const updatedQuery: Query = {
      ...currentQuery,
      rootGroup: {
        ...currentQuery.rootGroup,
        children: updatedChildren,
      },
      updatedAt: new Date(),
    };

    const preview = generateQueryPreview(
      updatedQuery.rootGroup,
      updatedQuery.schemaName,
    );
    set({ currentQuery: updatedQuery, queryPreview: preview });
  },

  // --- ACTION: Add a nested group ---
  addGroup: (parentGroupId: string) => {
    const { currentQuery } = get();
    if (!currentQuery) return;

    const newGroup = createEmptyGroup("AND");
    const updatedChildren = updateNodeInTree(
      currentQuery.rootGroup.children,
      parentGroupId,
      (node) => {
        if (node.type === "group") {
          return {
            ...node,
            children: [...node.children, newGroup],
          };
        }
        return node;
      },
    );

    const updatedQuery: Query = {
      ...currentQuery,
      rootGroup: {
        ...currentQuery.rootGroup,
        children: updatedChildren,
      },
      updatedAt: new Date(),
    };

    const preview = generateQueryPreview(
      updatedQuery.rootGroup,
      updatedQuery.schemaName,
    );
    set({ currentQuery: updatedQuery, queryPreview: preview });
  },

  // --- ACTION: Remove a node ---
  removeNode: (nodeId: string) => {
    const { currentQuery } = get();
    if (!currentQuery) return;

    // Don't allow removing the root group itself
    if (nodeId === currentQuery.rootGroup.id) return;

    const updatedChildren = removeNodeFromTree(
      currentQuery.rootGroup.children,
      nodeId,
    );

    // If root becomes empty, add an empty condition back
    const finalChildren =
      updatedChildren.length === 0 ? [createEmptyCondition()] : updatedChildren;

    const updatedQuery: Query = {
      ...currentQuery,
      rootGroup: {
        ...currentQuery.rootGroup,
        children: finalChildren,
      },
      updatedAt: new Date(),
    };

    const preview = generateQueryPreview(
      updatedQuery.rootGroup,
      updatedQuery.schemaName,
    );
    set({ currentQuery: updatedQuery, queryPreview: preview });
  },

  // --- ACTION: Update a condition's field, operator, or value ---
  updateCondition: (
    conditionId: string,
    updates: Partial<Pick<Condition, "field" | "operator" | "value">>,
  ) => {
    const { currentQuery } = get();
    if (!currentQuery) return;

    const updatedChildren = updateNodeInTree(
      currentQuery.rootGroup.children,
      conditionId,
      (node) => {
        if (node.type === "condition") {
          return { ...node, ...updates };
        }
        return node;
      },
    );

    const updatedQuery: Query = {
      ...currentQuery,
      rootGroup: {
        ...currentQuery.rootGroup,
        children: updatedChildren,
      },
      updatedAt: new Date(),
    };

    const preview = generateQueryPreview(
      updatedQuery.rootGroup,
      updatedQuery.schemaName,
    );
    set({ currentQuery: updatedQuery, queryPreview: preview });
  },

  // --- ACTION: Toggle AND/OR on a group ---
  updateLogicalOperator: (groupId: string, operator: LogicalOperator) => {
    const { currentQuery } = get();
    if (!currentQuery) return;

    const updatedChildren = updateNodeInTree(
      currentQuery.rootGroup.children,
      groupId,
      (node) => {
        if (node.type === "group") {
          return { ...node, logicalOperator: operator };
        }
        return node;
      },
    );

    const updatedQuery: Query = {
      ...currentQuery,
      rootGroup: {
        ...currentQuery.rootGroup,
        children: updatedChildren,
      },
      updatedAt: new Date(),
    };

    const preview = generateQueryPreview(
      updatedQuery.rootGroup,
      updatedQuery.schemaName,
    );
    set({ currentQuery: updatedQuery, queryPreview: preview });
  },

  // --- ACTION: Toggle group collapse (handled in UI) ---
  toggleCollapse: (_groupId: string) => {
    void _groupId; // void: evaluates a variable and discard the result
    // Collapse state is managed by UI components via local state
    // This action exists for future expansion
  },

  // --- ACTION: Execute the current query ---
  executeCurrentQuery: () => {
    const { currentQuery, dataset } = get();
    if (!currentQuery || dataset.length === 0) return;

    set({ isExecuting: true });

    // Simulate async execution for loading state
    setTimeout(() => {
      const filtered = executeQuery(
        currentQuery.rootGroup,
        dataset as unknown as Record<string, unknown>[],
      );
      set({
        results: filtered as unknown as UserRecord[],
        resultCount: filtered.length,
        isExecuting: false,
      });
    }, 300);
  },

  // --- ACTION: Save current query as a preset ---
  savePreset: (name: string) => {
    const { currentQuery, savedPresets } = get();
    if (!currentQuery) return;

    const newPreset: SavedQuery = {
      id: generateId(),
      name,
      query: deepClone(currentQuery),
      savedAt: new Date(),
    };

    set({ savedPresets: [...savedPresets, newPreset] });
  },

  // --- ACTION: Load a saved preset ---
  loadPreset: (presetId: string) => {
    const { savedPresets } = get();
    const preset = savedPresets.find((p: SavedQuery) => p.id === presetId);
    if (!preset) return;

    const loadedQuery = deepClone(preset.query);
    const preview = generateQueryPreview(
      loadedQuery.rootGroup,
      loadedQuery.schemaName,
    );
    set({
      currentQuery: loadedQuery,
      queryPreview: preview,
      results: null,
      validationErrors: [],
    });
  },

  // --- ACTION: Delete a saved preset ---
  deletePreset: (presetId: string) => {
    const { savedPresets } = get();
    set({
      savedPresets: savedPresets.filter((p: SavedQuery) => p.id !== presetId),
    });
  },

  // --- ACTION: Export query as JSON string ---
  exportQuery: () => {
    const { currentQuery } = get();
    if (!currentQuery) return "{}";
    return JSON.stringify(currentQuery, null, 2);
  },

  // --- ACTION: Import query from JSON string ---
  importQuery: (json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed.rootGroup || !parsed.rootGroup.type) {
        return false;
      }
      const preview = generateQueryPreview(
        parsed.rootGroup,
        parsed.schemaName || "users",
      );
      set({
        currentQuery: parsed as Query,
        queryPreview: preview,
        results: null,
        validationErrors: [],
      });
      return true;
    } catch {
      return false;
    }
  },

  // --- ACTION: Toggle dark mode ---
  toggleDarkMode: () => {
    const { isDarkMode } = get();
    const newValue = !isDarkMode;
    setStoredBoolean(STORAGE_KEYS.THEME, newValue);
    set({ isDarkMode: newValue });
  },

  // --- ACTION: Clear results ---
  clearResults: () => {
    set({ results: null, resultCount: 0 });
  },

  // --- ACTION: Load the schema ---
  loadSchema: () => {
    setStoredBoolean(STORAGE_KEYS.SCHEMA_LOADED, true);
    set({ schemaLoaded: true });
  },
}));
