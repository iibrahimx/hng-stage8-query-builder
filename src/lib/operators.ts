import { FieldType, Operator } from "@/types";

// ============================================================
// OPERATOR CONFIGURATION
// ============================================================

// Human-readable labels for each operator
export const operatorLabels: Record<Operator, string> = {
  equals: "Equals",
  notEquals: "Not Equals",
  contains: "Contains",
  startsWith: "Starts With",
  endsWith: "Ends With",
  greaterThan: "Greater Than",
  lessThan: "Less Than",
  greaterThanOrEqual: "Greater Than or Equal",
  lessThanOrEqual: "Less Than or Equal",
  between: "Between",
  in: "In",
  notIn: "Not In",
  isNull: "Is Null",
  isNotNull: "Is Not Null",
  regex: "Matches Regex",
};

// Which operators are valid for which field types
// This prevents "contains" on a number, for example
export const operatorsByFieldType: Record<FieldType, Operator[]> = {
  string: [
    "equals",
    "notEquals",
    "contains",
    "startsWith",
    "endsWith",
    "in",
    "notIn",
    "isNull",
    "isNotNull",
    "regex",
  ],
  number: [
    "equals",
    "notEquals",
    "greaterThan",
    "lessThan",
    "greaterThanOrEqual",
    "lessThanOrEqual",
    "between",
    "in",
    "notIn",
    "isNull",
    "isNotNull",
  ],
  enum: ["equals", "notEquals", "in", "notIn", "isNull", "isNotNull"],
  date: [
    "equals",
    "notEquals",
    "greaterThan",
    "lessThan",
    "greaterThanOrEqual",
    "lessThanOrEqual",
    "between",
    "isNull",
    "isNotNull",
  ],
  boolean: ["equals", "notEquals", "isNull", "isNotNull"],
};
