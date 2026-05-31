// --- FIELD DEFINITIONS ---

export type FieldType = "string" | "number" | "enum" | "date" | "boolean";

export interface FieldDefinition {
  name: string;
  type: FieldType;
  label?: string;
  options?: string[];
}

// The entire schema - a collection of field definitions
export interface Schema {
  name: string;
  fields: FieldDefinition[];
}

// --- OPERATORS ---

// All operators we support. Grouped by what they work on.
export type Operator =
  // Universal
  | "equals"
  | "notEquals"
  | "in"
  | "notIn"
  // Text-specific
  | "contains"
  | "startsWith"
  | "endsWith"
  // Number/Date-specific
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "between"
  // Special
  | "isNull"
  | "isNotNull"
  | "regex";

// --- THE QUERY TREE ---

// The logical connector for groups
export type LogicalOperator = "AND" | "OR";

// A single condition (leaf node in our tree)
export interface Condition {
  id: string;
  type: "condition"; // discriminator - tells us this is a condition
  field: string;
  operator: Operator;
  value: string | number | boolean | null | [string | number, string | number];
}

// A group (branch node in our tree)
export interface Group {
  id: string;
  type: "group"; // discriminator - tells us this is a group
  logicalOperator: LogicalOperator;
  children: QueryNode[];
}

// A node is EITHER a Condition OR a Group
// This is what enables the tree structure
export type QueryNode = Condition | Group;

// The top-level query structure
export interface Query {
  id: string;
  name: string;
  schemaName: string;
  rootGroup: Group;
  createdAt: Date;
  updatedAt: Date;
}

// --- VALIDATION ---

export interface ValidationError {
  nodeId: string;
  message: string;
  field?: string;
}

// --- QUERY HISTORY / SAVED ---

export interface SavedQuery {
  id: string;
  name: string;
  query: Query;
  savedAt: Date;
}
