# HNG Stage 8 — Visual Query Builder

A professional visual query builder that allows users to construct complex database and API queries through an intuitive graphical interface instead of writing raw query syntax manually.

**Live Demo:** [Live Demo Link](https://www.loom.com/share/5959a38f3a704b9f81ed9d5a7f07069f)
**Repository:** [GitHub Repository URL](https://github.com/iibrahimx/hng-stage8-query-builder)

---

## Table of Contents

- [Overview](#overview)
- [Architecture Explanation](#architecture-explanation)
- [Recursive Rendering Strategy](#recursive-rendering-strategy)
- [State Management Decisions](#state-management-decisions)
- [Query Engine Design](#query-engine-design)
- [Performance Optimization Techniques](#performance-optimization-techniques)
- [Trade-offs Made](#trade-offs-made)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Testing](#testing)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Overview

This project was built for the HNG Stage 8 Frontend Engineering Challenge.

The application enables users to:

- Build queries visually using fields, operators, and values
- Create nested logical groups with unlimited depth
- Preview generated query syntax in real time
- Execute queries against a mock dataset
- Inspect matching results dynamically
- Save, load, import, and export queries
- Manage query history and presets

The architecture prioritizes scalability, recursive UI rendering, maintainability, and performance.

---

# Architecture Explanation

The application follows a layered architecture that separates concerns into distinct areas.

## 1. Data Layer (`src/types`, `src/data`)

Responsible for defining application models and providing schema-driven data.

### Responsibilities

- Query type definitions
- Recursive tree models
- Mock dataset
- Schema definitions

### Core Model

```text
Query
└── Root Group
    ├── Condition
    ├── Condition
    └── Group
        ├── Condition
        └── Condition
```

The query tree is represented using a recursive `QueryNode` union type:

```ts
type QueryNode = Condition | Group;
```

This structure enables unlimited nesting depth while maintaining strong TypeScript safety.

---

## 2. Logic Layer (`src/lib`)

Contains framework-independent business logic.

### Modules

| Module            | Responsibility                                  |
| ----------------- | ----------------------------------------------- |
| `query-engine.ts` | Query execution, validation, preview generation |
| `operators.ts`    | Field-type-aware operator mapping               |
| `storage.ts`      | Cookie and localStorage helpers                 |
| `utils.ts`        | Generic utility functions                       |

This layer contains pure functions and can be tested independently from React.

---

## 3. Presentation Layer (`src/components`, `src/store`)

Responsible for rendering UI and managing application state.

### Components

- Schema Explorer
- Query Workspace
- Results Panel
- History Panel
- Reusable UI primitives

### State Layer

Zustand acts as the bridge between the UI and business logic layers.

---

# Recursive Rendering Strategy

Recursive rendering is the foundation of the application.

The query structure is recursive by nature:

```text
Root (AND)
├── Condition (age > 18)
├── Condition (country = "Nigeria")
└── Group (OR)
    ├── Condition (status = "active")
    └── Condition (purchases > 10)
```

Each group renders its children dynamically.

Pseudo-flow:

```text
GroupNode
 ├── ConditionNode
 ├── ConditionNode
 └── GroupNode
      ├── ConditionNode
      └── GroupNode
```

The same component is reused regardless of nesting depth.

### Benefits

- Unlimited nesting support
- Minimal duplicated code
- Easy maintenance
- Highly scalable architecture

---

## Collapsible Groups

Groups can be expanded or collapsed using local UI state.

Collapsed groups do not render their children, reducing visual complexity and improving performance.

---

## Drag-and-Drop

The application uses `@dnd-kit` to support reordering within groups.

The implementation includes:

- Sortable conditions
- Sortable groups
- Immutable tree updates
- Smooth drag interactions

---

# State Management Decisions

## Library: Zustand

Zustand was selected because it provides:

- Minimal boilerplate
- TypeScript-first development
- Fine-grained subscriptions
- Excellent performance
- Simple immutable updates

---

## State Architecture

```text
QueryState
├── currentQuery
├── schema
├── dataset
├── results
├── queryPreview
├── queryHistory
├── savedPresets
└── isDarkMode
```

Components subscribe only to the state slices they require.

Example:

```ts
const isDarkMode = useQueryStore((state) => state.isDarkMode);
```

This prevents unrelated state updates from triggering unnecessary re-renders.

---

## Recursive Immutable Updates

Three helper functions power tree mutations:

### `updateNodeInTree`

Recursively locates a node and rebuilds the path back to the root with new references.

### `removeNodeFromTree`

Removes nodes recursively while preserving tree integrity.

### `reorderChildren`

Performs immutable drag-and-drop reordering.

This approach ensures React can efficiently detect state changes through shallow comparisons.

---

## Persistence

### localStorage

Used for:

- Theme preference
- Schema state

### Cookies

Used for:

- Current query persistence

This avoids hydration issues while preserving state across refreshes.

---

# Query Engine Design

The query engine is implemented as a collection of pure functions.

---

## Core Functions

### `executeQuery(group, records)`

Entry point for query execution.

Filters dataset records against the query tree.

---

### `evaluateGroup(group, record)`

Recursively evaluates nested groups.

**AND Logic**

```ts
Array.every();
```

**OR Logic**

```ts
Array.some();
```

Both benefit from short-circuit evaluation.

---

### `evaluateCondition(condition, record)`

Evaluates individual conditions using operator-specific comparisons.

---

### `generateQueryPreview(group, schemaName)`

Produces SQL-like query output.

Example:

```sql
SELECT *
FROM users
WHERE age > 18
AND status = 'active'
```

The preview updates in real time as the user edits the query.

---

### `validateQuery(group, fields)`

Performs recursive validation.

Checks include:

- Empty groups
- Invalid operators
- Missing values
- Invalid field references
- Invalid ranges

---

## Operator System

| Field Type | Supported Operators                                                 |
| ---------- | ------------------------------------------------------------------- |
| String     | equals, notEquals, contains, startsWith, endsWith, in, notIn, regex |
| Number     | equals, notEquals, greaterThan, lessThan, between, in, notIn        |
| Enum       | equals, notEquals, in, notIn                                        |
| Date       | equals, greaterThan, lessThan, between                              |
| Boolean    | equals, notEquals                                                   |

The UI automatically adapts based on field type.

---

# Performance Optimization Techniques

## 1. React.memo

Applied to:

- GroupNode
- ConditionNode
- SortableCondition

Prevents unnecessary re-renders.

---

## 2. Selective Zustand Subscriptions

Components subscribe only to required state.

Benefits:

- Reduced rendering overhead
- Better scalability

---

## 3. Short-Circuit Evaluation

The query engine uses:

```ts
Array.every();
Array.some();
```

which stop execution as soon as a result is determined.

---

## 4. Stable Keys

Each node uses:

```ts
crypto.randomUUID();
```

to maintain stable React identities.

---

## 5. Immutable Tree Updates

Only modified paths receive new references.

Benefits:

- Efficient reconciliation
- Better React performance

---

## 6. Collapsible Rendering

Collapsed groups skip child rendering entirely, reducing component tree depth.

---

# Trade-offs Made

## 1. Inline Preset Naming

**Decision:** Inline input instead of modal.

**Reason:** Simpler implementation, improved accessibility, and reduced UI complexity.

---

## 2. No Pagination or Virtualization

**Decision:** Render all rows.

**Reason:** Dataset size is intentionally small.

For large datasets, virtualization would be implemented using:

```text
@tanstack/react-virtual
```

---

## 3. Cookie-Based Query Persistence

**Decision:** Use cookies instead of localStorage.

**Reason:** Cookies are accessible during SSR and help avoid hydration issues.

---

## 4. Shared History & Presets View

**Decision:** Presets appear within the History panel.

**Reason:** Reduces navigation complexity while maintaining functionality.

---

## 5. Mock Dataset

**Decision:** Use in-memory data.

**Reason:** The challenge specifies mock execution.

The query engine remains compatible with real API data sources.

---

## 6. Schema Switching Resets Query

**Decision:** Switching schemas clears the current query.

**Reason:** Each schema has different fields and types. Preserving a query built for one schema when switching to another would result in invalid field references. A fresh start per schema is safer and clearer for users.

---

# Features

- Visual query builder
- Unlimited nested condition groups
- AND / OR logic switching
- Schema-driven field controls
- Dynamic operator filtering
- Live SQL-like query preview
- Query execution simulator
- Query validation engine
- Query history
- Saved query presets
- CSV export
- JSON export/import
- Drag-and-drop reordering
- Collapsible groups
- Keyboard shortcuts
- Dark and light mode
- Responsive layout
- Resizable panels
- Accessibility-friendly design
- Data-testid support for testing

---

---

## Multi-Schema Support

The application supports 5 distinct schemas, switchable via a dropdown in the Schema Explorer panel:

| Schema   | Fields | Records | Key Field Types                              |
| -------- | ------ | ------- | -------------------------------------------- |
| users    | 9      | 15      | string, number, enum (country, status), date |
| products | 8      | 12      | string, number, enum (category), boolean     |
| orders   | 7      | 8       | string, number, enum (status), date, boolean |
| workers  | 7      | 8       | string, number, enum (department), date      |
| cities   | 6      | 10      | string, number, enum (continent), boolean    |

Switching schemas resets the current query and loads the appropriate dataset. All queries, history, and presets are schema-specific.

---

# Testing

The application includes tests covering:

- Query generation logic
- Validation engine behavior
- State management logic
- Utility functions
- Recursive rendering behavior
- Critical user interactions

Testing tools include:

- Vitest
- React Testing Library
- Playwright

---

# Tech Stack

| Technology               | Purpose                      |
| ------------------------ | ---------------------------- |
| Next.js 16 (App Router)  | Framework                    |
| TypeScript               | Type Safety                  |
| Tailwind CSS v4          | Styling & Theme System       |
| Zustand                  | State Management             |
| @dnd-kit/core & sortable | Drag-and-Drop Reordering     |
| react-resizable-panels   | Resizable Three-Panel Layout |
| Lucide React             | Icons                        |
| Geist & IBM Plex         | Typography                   |
| Vitest                   | Unit Testing                 |

---

# Getting Started

```bash
# Clone repository
git clone https://github.com/iibrahimx/hng-stage8-query-builder.git

# Navigate to project
cd hng-stage8-query-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Project Structure

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
|   │   └── Header.tsx
│   └── query-builder/
|       ├── HistoryPanel.tsx
│       ├── QueryWorkspace.ts
│       ├── ResultsPanel.ts
│       └── SchemaPanel.tsx
│
├── data/
│   ├── index.ts
│   ├── cities-schema.ts
│   ├── cities-dataset.ts
│   ├── orders-schema.ts
│   ├── orders-dataset.ts
│   ├── products-schema.ts
│   ├── products-dataset.ts
│   ├── workers-schema.ts
│   ├── workers-dataset.ts
│   ├── users-schema.ts
│   └── users-dataset.ts
│
├── lib/
│   ├── __tests__/query-engine.test.ts
│   ├── index.ts
│   ├── query-engine.ts
│   ├── operators.ts
│   ├── storage.ts
│   └── utils.ts
│
├── store/
│   └── query-store.ts
│
└── types/
    ├── index.ts
    └── query.ts
```
