import { Condition, Group, QueryNode } from "@/types";
import { ValidationError } from "@/types";
import { operatorsByFieldType } from "./operators";
import { FieldDefinition } from "@/types";

// ============================================================
// QUERY ENGINE - Evaluates query trees against data
// ============================================================

// Custom type for any record object - avoids conflict with TypeScript's built-in Record type
type DataRecord = Record<string, unknown>;

/**
 * Main entry point: takes a group (root of query tree) and an array of records,
 * returns only the records that match the entire query
 */
export function executeQuery(
  group: Group,
  records: DataRecord[],
): DataRecord[] {
  return records.filter((record) => evaluateGroup(group, record));
}

/**
 * Recursively evaluates a group against a single record.
 * If logicalOperator is AND: ALL children must match
 * If logicalOperator is OR: AT LEAST ONE child must match
 */
function evaluateGroup(group: Group, record: DataRecord): boolean {
  if (group.children.length === 0) {
    // An empty group matches everything (no conditions to fail)
    return true;
  }

  if (group.logicalOperator === "AND") {
    // AND: every single child must return true
    // .every() stops early if any child fails - efficient!
    return group.children.every((child) => evaluateNode(child, record));
  } else {
    // OR: at least one child must return true
    // .some() stops early if any child succeeds
    return group.children.some((child) => evaluateNode(child, record));
  }
}

/**
 * Evaluates a single node (Condition or Group) against a record
 * Uses the discriminator property to know which logic to run
 */
function evaluateNode(node: QueryNode, record: DataRecord): boolean {
  if (node.type === "condition") {
    return evaluateCondition(node, record);
  } else {
    // It's a group, so recurse into it
    return evaluateGroup(node, record);
  }
}

/**
 * Evaluates a single condition: field + operator + value
 * This is where actual comparisons happen
 */
function evaluateCondition(condition: Condition, record: DataRecord): boolean {
  const fieldValue = record[condition.field];
  const expectedValue = condition.value;

  // Handle null checks first - they don't need type-specific logic
  if (condition.operator === "isNull") {
    return fieldValue === null || fieldValue === undefined;
  }
  if (condition.operator === "isNotNull") {
    return fieldValue !== null && fieldValue !== undefined;
  }

  // If the field doesn't exist or is null, most comparisons fail
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  // Route to the correct comparison based on operator
  switch (condition.operator) {
    case "equals":
      return fieldValue === expectedValue;

    case "notEquals":
      return fieldValue !== expectedValue;

    case "contains":
      // Case-insensitive string contains
      return String(fieldValue)
        .toLowerCase()
        .includes(String(expectedValue).toLowerCase());

    case "startsWith":
      return String(fieldValue)
        .toLowerCase()
        .startsWith(String(expectedValue).toLowerCase());

    case "endsWith":
      return String(fieldValue)
        .toLowerCase()
        .endsWith(String(expectedValue).toLowerCase());

    case "greaterThan":
      return (
        Number(fieldValue as string | number) >
        Number(expectedValue as string | number)
      );

    case "lessThan":
      return (
        Number(fieldValue as string | number) <
        Number(expectedValue as string | number)
      );

    case "greaterThanOrEqual":
      return (
        Number(fieldValue as string | number) >=
        Number(expectedValue as string | number)
      );

    case "lessThanOrEqual":
      return (
        Number(fieldValue as string | number) <=
        Number(expectedValue as string | number)
      );

    case "between":
      // between expects a tuple: [min, max]
      if (Array.isArray(expectedValue) && expectedValue.length === 2) {
        const min = Number(expectedValue[0] as string | number);
        const max = Number(expectedValue[1] as string | number);
        const num = Number(fieldValue as string | number);
        return num >= min && num <= max;
      }
      return false;

    case "in":
      // "in" expects an array of values
      if (Array.isArray(expectedValue)) {
        return expectedValue.includes(fieldValue as string | number);
      }
      return false;

    case "notIn":
      if (Array.isArray(expectedValue)) {
        return !expectedValue.includes(fieldValue as string | number);
      }
      return true;

    case "regex":
      try {
        const regex = new RegExp(String(expectedValue));
        return regex.test(String(fieldValue));
      } catch {
        // Invalid regex shouldn't crash the app
        return false;
      }

    default:
      return false;
  }
}

// ============================================================
// QUERY PREVIEW GENERATOR
// ============================================================

/**
 * Generates a human-readable SQL-like string from a query tree
 */
export function generateQueryPreview(
  group: Group,
  schemaName: string = "records",
): string {
  const conditions = generateGroupString(group);

  if (!conditions) {
    return `SELECT * FROM ${schemaName}`;
  }

  return `SELECT * FROM ${schemaName}\nWHERE ${conditions}`;
}

/**
 * Recursively generates the condition string for a group
 */
function generateGroupString(group: Group, depth: number = 0): string {
  if (group.children.length === 0) {
    return "";
  }

  const parts = group.children
    .map((child) => generateNodeString(child, depth + 1))
    .filter(Boolean); // Remove empty strings

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  // Wrap in parentheses and join with the logical operator
  const joined = parts.join(` ${group.logicalOperator} `);

  // Root level (depth 0) doesn't need wrapping parentheses
  if (depth === 0) {
    return joined;
  }

  return `(${joined})`;
}

/**
 * Generates string for a single node
 */
function generateNodeString(node: QueryNode, depth: number): string {
  if (node.type === "condition") {
    return formatCondition(node);
  }
  return generateGroupString(node, depth);
}

/**
 * Formats a single condition into readable text
 */
function formatCondition(condition: Condition): string {
  const field = condition.field;
  const op = condition.operator;
  const val = condition.value;

  switch (op) {
    case "equals":
      return `${field} = ${formatValue(val)}`;
    case "notEquals":
      return `${field} != ${formatValue(val)}`;
    case "contains":
      return `${field} CONTAINS ${formatValue(val)}`;
    case "startsWith":
      return `${field} STARTS WITH ${formatValue(val)}`;
    case "endsWith":
      return `${field} ENDS WITH ${formatValue(val)}`;
    case "greaterThan":
      return `${field} > ${formatValue(val)}`;
    case "lessThan":
      return `${field} < ${formatValue(val)}`;
    case "greaterThanOrEqual":
      return `${field} >= ${formatValue(val)}`;
    case "lessThanOrEqual":
      return `${field} <= ${formatValue(val)}`;
    case "between":
      if (Array.isArray(val)) {
        return `${field} BETWEEN ${formatValue(val[0])} AND ${formatValue(val[1])}`;
      }
      return `${field} BETWEEN ?`;
    case "in":
      if (Array.isArray(val)) {
        return `${field} IN (${val.map(formatValue).join(", ")})`;
      }
      return `${field} IN (?)`;
    case "notIn":
      if (Array.isArray(val)) {
        return `${field} NOT IN (${val.map(formatValue).join(", ")})`;
      }
      return `${field} NOT IN (?)`;
    case "isNull":
      return `${field} IS NULL`;
    case "isNotNull":
      return `${field} IS NOT NULL`;
    case "regex":
      return `${field} REGEX ${formatValue(val)}`;
    default:
      return `${field} ? ${formatValue(val)}`;
  }
}

/**
 * Helper to format values for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "string") {
    return `'${value}'`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`;
  }
  return String(value);
}

// ============================================================
// QUERY VALIDATION ENGINE
// ============================================================

/**
 * Validates an entire query tree and returns all errors found
 */
export function validateQuery(
  group: Group,
  fields: FieldDefinition[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  validateGroup(group, fields, errors);
  return errors;
}

function validateGroup(
  group: Group,
  fields: FieldDefinition[],
  errors: ValidationError[],
): void {
  // Empty groups with no children are invalid
  if (group.children.length === 0) {
    errors.push({
      nodeId: group.id,
      message:
        "Group cannot be empty. Add at least one condition or nested group.",
    });
    return;
  }

  for (const child of group.children) {
    if (child.type === "condition") {
      validateCondition(child, fields, errors);
    } else {
      validateGroup(child, fields, errors);
    }
  }
}

function validateCondition(
  condition: Condition,
  fields: FieldDefinition[],
  errors: ValidationError[],
): void {
  // Check if field exists in schema
  const fieldDef = fields.find((f) => f.name === condition.field);

  if (!fieldDef) {
    errors.push({
      nodeId: condition.id,
      field: condition.field,
      message: `Field "${condition.field}" does not exist in the schema.`,
    });
    return;
  }

  // Check if operator is valid for this field type
  const validOperators = operatorsByFieldType[fieldDef.type];
  if (!validOperators.includes(condition.operator)) {
    errors.push({
      nodeId: condition.id,
      field: condition.field,
      message: `Operator "${condition.operator}" is not valid for field type "${fieldDef.type}".`,
    });
    return;
  }

  // Check value presence for operators that require a value
  const requiresValue = !["isNull", "isNotNull"].includes(condition.operator);
  if (
    requiresValue &&
    (condition.value === null ||
      condition.value === undefined ||
      condition.value === "")
  ) {
    errors.push({
      nodeId: condition.id,
      field: condition.field,
      message: "A value is required for this operator.",
    });
  }

  // Check "between" operator has a valid tuple
  if (condition.operator === "between") {
    if (!Array.isArray(condition.value) || condition.value.length !== 2) {
      errors.push({
        nodeId: condition.id,
        field: condition.field,
        message: 'The "between" operator requires a range with two values.',
      });
    }
  }
}
