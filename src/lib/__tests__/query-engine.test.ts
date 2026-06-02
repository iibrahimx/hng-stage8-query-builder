import { describe, it, expect } from "vitest";
import {
  executeQuery,
  generateQueryPreview,
  validateQuery,
} from "@/lib/query-engine";
import { Group, Operator } from "@/types";
import { usersSchema } from "@/data";

// Simple mock data
const mockUsers = [
  { name: "Alice", age: 28, country: "Nigeria", status: "active" },
  { name: "Bob", age: 17, country: "Ghana", status: "inactive" },
  { name: "Charlie", age: 35, country: "Nigeria", status: "active" },
  { name: "Diana", age: 22, country: "Kenya", status: "suspended" },
];

// Helper to create a simple query
function makeQuery(
  conditions: Array<{
    field: string;
    operator: Operator;
    value: string | number | boolean | null;
  }>,
): Group {
  return {
    id: "root",
    type: "group",
    logicalOperator: "AND",
    children: conditions.map((c, i) => ({
      id: `c${i}`,
      type: "condition" as const,
      field: c.field,
      operator: c.operator,
      value: c.value,
    })),
  };
}

describe("Query Engine", () => {
  describe("executeQuery", () => {
    it("filters by equals operator", () => {
      const query = makeQuery([
        { field: "country", operator: "equals", value: "Nigeria" },
      ]);
      const result = executeQuery(query, mockUsers);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(["Alice", "Charlie"]);
    });

    it("filters by greaterThan operator", () => {
      const query = makeQuery([
        { field: "age", operator: "greaterThan", value: 25 },
      ]);
      const result = executeQuery(query, mockUsers);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(["Alice", "Charlie"]);
    });

    it("combines multiple conditions with AND", () => {
      const query: Group = {
        id: "root",
        type: "group",
        logicalOperator: "AND",
        children: [
          {
            id: "c1",
            type: "condition",
            field: "country",
            operator: "equals",
            value: "Nigeria",
          },
          {
            id: "c2",
            type: "condition",
            field: "age",
            operator: "greaterThan",
            value: 25,
          },
        ],
      };
      const result = executeQuery(query, mockUsers);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(["Alice", "Charlie"]);
    });

    it("handles nested OR groups", () => {
      const query: Group = {
        id: "root",
        type: "group",
        logicalOperator: "AND",
        children: [
          {
            id: "g1",
            type: "group",
            logicalOperator: "OR",
            children: [
              {
                id: "c1",
                type: "condition",
                field: "country",
                operator: "equals",
                value: "Nigeria",
              },
              {
                id: "c2",
                type: "condition",
                field: "country",
                operator: "equals",
                value: "Kenya",
              },
            ],
          },
          {
            id: "c3",
            type: "condition",
            field: "status",
            operator: "equals",
            value: "active",
          },
        ],
      };
      const result = executeQuery(query, mockUsers);
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no matches", () => {
      const query = makeQuery([
        { field: "country", operator: "equals", value: "USA" },
      ]);
      const result = executeQuery(query, mockUsers);
      expect(result).toHaveLength(0);
    });

    it("handles isNull operator", () => {
      const usersWithNull = [
        ...mockUsers,
        { name: "Eve", age: null, country: null, status: null },
      ];
      const query = makeQuery([
        { field: "country", operator: "isNull", value: null },
      ]);
      const result = executeQuery(query, usersWithNull);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Eve");
    });
  });

  describe("generateQueryPreview", () => {
    it("generates SQL-like preview for simple query", () => {
      const query = makeQuery([
        { field: "age", operator: "greaterThan", value: 18 },
      ]);
      const preview = generateQueryPreview(query, "users");
      expect(preview).toContain("SELECT * FROM users");
      expect(preview).toContain("WHERE");
      expect(preview).toContain("age > 18");
    });

    it("shows nested groups with parentheses", () => {
      const query: Group = {
        id: "root",
        type: "group",
        logicalOperator: "AND",
        children: [
          {
            id: "c1",
            type: "condition",
            field: "status",
            operator: "equals",
            value: "active",
          },
          {
            id: "g1",
            type: "group",
            logicalOperator: "OR",
            children: [
              {
                id: "c2",
                type: "condition",
                field: "country",
                operator: "equals",
                value: "Nigeria",
              },
              {
                id: "c3",
                type: "condition",
                field: "country",
                operator: "equals",
                value: "Ghana",
              },
            ],
          },
        ],
      };
      const preview = generateQueryPreview(query, "users");
      expect(preview).toContain("status = 'active'");
      expect(preview).toContain("(");
      expect(preview).toContain("country = 'Nigeria'");
      expect(preview).toContain("OR");
    });
  });

  describe("validateQuery", () => {
    it("returns error for empty group", () => {
      const query: Group = {
        id: "root",
        type: "group",
        logicalOperator: "AND",
        children: [],
      };
      const errors = validateQuery(query, usersSchema.fields);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain("empty");
    });

    it("returns error for invalid field", () => {
      const query = makeQuery([
        { field: "invalidField", operator: "equals", value: "test" },
      ]);
      const errors = validateQuery(query, usersSchema.fields);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain("does not exist");
    });

    it("returns no errors for valid query", () => {
      const query = makeQuery([
        { field: "age", operator: "greaterThan", value: 18 },
      ]);
      const errors = validateQuery(query, usersSchema.fields);
      expect(errors).toHaveLength(0);
    });
  });
});
