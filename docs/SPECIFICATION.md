# @oxog/json Specification

## Package Overview

| Field | Value |
|-------|-------|
| **Package Name** | `@oxog/json` |
| **Version** | 1.0.0 |
| **License** | MIT |
| **Author** | Ersin Koc |
| **Repository** | https://github.com/ersinkoc/json |
| **Documentation** | https://json.oxog.dev |

## Description

Zero-dependency, plugin-based JSON Swiss Army Knife for TypeScript. Parse, query, transform, diff, validate, stream, and repair JSON with a single import. Replaces dozens of single-purpose packages with a unified, type-safe, micro-kernel architecture.

---

## Core Principles

### 1. Zero Runtime Dependencies

The package MUST have zero runtime dependencies:

```json
{
  "dependencies": {}
}
```

All functionality must be implemented from scratch:
- Custom JSON parser with error recovery
- Custom JSONPath engine
- Custom JSON Schema validator
- Custom streaming parser
- All utilities implemented in-house

### 2. Plugin Architecture

All functionality is delivered through plugins:

- **Core Plugins**: Always loaded (parse, stringify, query)
- **Optional Plugins**: Loaded on demand (path, transform, diff, patch, schema, stream, repair, json5, type, immutable)

### 3. Universal Runtime

Support for:
- Node.js 18+
- Modern browsers
- Deno
- Bun
- Edge runtimes

### 4. TypeScript First

- Strict mode enabled
- Full type inference
- Type guards for runtime validation
- Comprehensive JSDoc documentation

---

## Feature Specification

### Core Features (Always Available)

#### 1. Parse Plugin

**Purpose**: Parse JSON strings with enhanced features

**API**:
```typescript
json.parse(text: string, options?: ParseOptions): JsonValue
json.safeParse(text: string, options?: ParseOptions): JsonResult<JsonValue>
```

**Options**:
```typescript
interface ParseOptions {
  reviver?: (key: string, value: unknown) => unknown;
  maxDepth?: number;      // Default: 512
  maxLength?: number;     // Default: 10MB
  strict?: boolean;       // Default: false
}
```

**Behavior**:
- Drop-in replacement for `JSON.parse`
- Depth limiting for security
- Length limiting for DoS protection
- Safe parse variant returns Result type

#### 2. Stringify Plugin

**Purpose**: Serialize values to JSON with advanced options

**API**:
```typescript
json.stringify(value: unknown, options?: StringifyOptions): string
```

**Options**:
```typescript
interface StringifyOptions {
  indent?: number | string;
  replacer?: (key: string, value: unknown) => unknown;
  circular?: string | false;  // Handle circular references
  sortKeys?: boolean;         // Deterministic output
}
```

**Behavior**:
- Drop-in replacement for `JSON.stringify`
- Circular reference handling (replace or throw)
- Sorted keys for deterministic output
- Pretty printing support

#### 3. Query Plugin

**Purpose**: Deep property access and manipulation

**API**:
```typescript
json.get(obj: unknown, path: string, fallback?: unknown): unknown
json.set(obj: unknown, path: string, value: unknown): unknown
json.has(obj: unknown, path: string): boolean
json.remove(obj: unknown, path: string): unknown
json.paths(obj: unknown): string[]
```

**Path Syntax**:
- Dot notation: `users.0.name`
- Bracket notation: `users[0].name`
- Mixed: `users[0].address.city`

**Behavior**:
- Immutable operations (returns new objects)
- Safe access (returns undefined/fallback for missing paths)
- Path enumeration for debugging

---

### Optional Features (Plugin-based)

#### 4. JSONPath Plugin

**Purpose**: Complex queries using JSONPath expressions

**API**:
```typescript
json.query(data: unknown, expression: string): unknown[]
```

**Supported Expressions**:
- Root: `$`
- Child: `$.store.book`
- Wildcard: `$[*]`, `$.*`
- Subscript: `$[0]`, `$[0:2]`
- Filter: `$[?(@.price < 10)]`
- Union: `$[0,1]`

#### 5. Transform Plugin

**Purpose**: Object transformation utilities

**API**:
```typescript
json.merge(...objects: object[]): object
json.flatten(obj: object, separator?: string): object
json.unflatten(obj: object, separator?: string): object
json.pick(obj: object, keys: string[]): object
json.omit(obj: object, keys: string[]): object
json.sortKeys(obj: object): object
json.mapValues(obj: object, fn: (value: unknown, key: string) => unknown): object
json.filterValues(obj: object, fn: (value: unknown, key: string) => boolean): object
```

#### 6. Diff Plugin

**Purpose**: Generate RFC 6902 JSON Patch from differences

**API**:
```typescript
json.diff(before: unknown, after: unknown): JsonPatchOperation[]
```

**Output Format**:
```typescript
type JsonPatchOperation =
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'move'; from: string; path: string }
  | { op: 'copy'; from: string; path: string }
  | { op: 'test'; path: string; value: unknown };
```

#### 7. Patch Plugin

**Purpose**: Apply RFC 6902 JSON Patch operations

**API**:
```typescript
json.patch(obj: unknown, operations: JsonPatchOperation[]): unknown
json.validatePatch(operations: JsonPatchOperation[]): { valid: boolean; errors?: string[] }
json.reversePatch(operations: JsonPatchOperation[], original: unknown): JsonPatchOperation[]
```

#### 8. Schema Plugin

**Purpose**: JSON Schema validation (draft-07)

**API**:
```typescript
json.validate(data: unknown, schema: JsonSchema): ValidationResult
json.compile(schema: JsonSchema): (data: unknown) => ValidationResult
json.is<T>(data: unknown, schema: JsonSchema): data is T
```

**Supported Keywords**:
- type, enum, const
- Multiple types via oneOf, anyOf, allOf
- String: minLength, maxLength, pattern, format
- Number: minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf
- Array: items, minItems, maxItems, uniqueItems
- Object: properties, required, additionalProperties, minProperties, maxProperties
- Composition: not, if/then/else

**Formats**: email, uri, date, date-time, uuid, regex

#### 9. Stream Plugin

**Purpose**: Streaming JSON processing

**API**:
```typescript
json.stream.parse(readable: ReadableStream | NodeReadable): AsyncIterable<unknown>
json.stream.stringify(data: unknown, writable: WritableStream | NodeWritable): Promise<void>
json.stream.parseLines(readable: ReadableStream | NodeReadable): AsyncIterable<unknown>
json.stream.stringifyLines(data: unknown[], writable: WritableStream | NodeWritable): Promise<void>
```

#### 10. Repair Plugin

**Purpose**: Fix malformed JSON

**API**:
```typescript
json.repair(text: string): string
```

**Fixes Applied**:
- Trailing commas
- Single quotes → double quotes
- Unquoted keys
- Unquoted string values
- JavaScript comments
- Missing quotes
- Multiple issues simultaneously

#### 11. JSON5 Plugin

**Purpose**: JSON5 format support

**API**:
```typescript
json.parse5(text: string): unknown
json.stringify5(value: unknown, options?: Json5Options): string
```

**JSON5 Features**:
- Comments (single and multi-line)
- Trailing commas
- Unquoted keys
- Single-quoted strings
- Hexadecimal numbers
- Numbers: leading/trailing decimal point, Infinity, -Infinity, NaN

#### 12. Type Plugin

**Purpose**: TypeScript type inference

**API**:
```typescript
json.infer(data: unknown | unknown[], options?: InferOptions): string
```

**Options**:
```typescript
interface InferOptions {
  name?: string;        // Interface name (default: 'Root')
  export?: boolean;     // Add export keyword
  union?: boolean;      // Create unions for multiple samples
}
```

#### 13. Immutable Plugin

**Purpose**: Immutable data structures

**API**:
```typescript
json.freeze(obj: unknown): unknown
json.immutableSet(obj: unknown, path: string, value: unknown): unknown
json.clone(obj: unknown): unknown
```

---

## Type System

### Core Types

```typescript
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonResult<T> {
  ok: boolean;
  value?: T;
  error?: JsonError;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params?: Record<string, unknown>;
}
```

### Error Types

```typescript
class JsonError extends Error {
  code: string;
  context?: Record<string, unknown>;
}

class JsonParseError extends JsonError { code: 'JSON_PARSE_ERROR' }
class JsonPathError extends JsonError { code: 'JSON_PATH_ERROR' }
class JsonSchemaError extends JsonError { code: 'JSON_SCHEMA_ERROR' }
class JsonPatchError extends JsonError { code: 'JSON_PATCH_ERROR' }
class MaxDepthError extends JsonError { code: 'MAX_DEPTH_ERROR' }
class PluginError extends JsonError { code: 'PLUGIN_ERROR' }
```

---

## Plugin System

### Plugin Interface

```typescript
interface JsonPlugin<TContext = unknown> {
  name: string;
  version: string;
  dependencies?: string[];
  install: (kernel: JsonKernel<TContext>) => void;
  onInit?: (context: TContext) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}
```

### Plugin Registration

```typescript
// Register plugins
json.use(plugin1, plugin2, plugin3);

// Presets
json.use(preset.full);      // All plugins
json.use(preset.minimal);   // Core + transform + repair
json.use(preset.validation); // schema + type
json.use(preset.processing); // transform + diff + patch + stream

// Custom preset
const myPreset = json.createPreset([transform, schema]);
json.use(myPreset);
```

---

## CLI Specification

### Commands

| Command | Description |
|---------|-------------|
| `format` | Pretty print JSON |
| `minify` | Minify JSON |
| `get` | Get value by path |
| `query` | JSONPath query |
| `diff` | Compare two files |
| `patch` | Apply JSON patch |
| `validate` | Validate against schema |
| `repair` | Fix broken JSON |
| `infer` | Generate TypeScript types |
| `flatten` | Flatten nested JSON |
| `unflatten` | Unflatten dotted keys |
| `merge` | Deep merge files |
| `lines` | Process JSONL files |

### Options

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file |
| `-i, --indent <n>` | Indentation |
| `-s, --schema <file>` | Schema file |
| `--format <format>` | Output format |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Bundle size (kernel) | < 5KB gzipped |
| Bundle size (core plugins) | < 10KB gzipped |
| Bundle size (all plugins) | < 15KB gzipped |
| Parse speed | Comparable to native JSON.parse |
| Memory efficiency | No memory leaks |

---

## Quality Requirements

| Requirement | Target |
|-------------|--------|
| Test coverage | 100% |
| TypeScript strict mode | Enabled |
| ESLint | No errors |
| Documentation | All public APIs |
| Examples | 18+ organized examples |

---

## LLM Integration

### llms.txt

A concise file (< 2000 tokens) at project root containing:
- Installation
- Basic usage
- API summary
- Error codes
- Links

### MCP Server

Tools for LLM integration:
- `json_search_docs`: Search documentation
- `json_get_example`: Get usage examples
- `json_api_reference`: API reference
- `json_validate_snippet`: Validate JSON

---

## Website Specification

### Technology Stack

- React 19.x
- Vite 6.x
- TypeScript 5.x
- Tailwind CSS 4.x
- shadcn/ui
- @oxog/codeshine (syntax highlighting)
- Lucide React (icons)
- React Router 7.x

### Pages

1. **Home**: Hero, features, quick start
2. **Docs**: Comprehensive documentation
3. **API Reference**: All public APIs
4. **Examples**: 18+ categorized examples
5. **Plugins**: Plugin documentation
6. **Playground**: Live editor

### Features

- Dark/light theme
- Mobile responsive
- IDE-style code blocks
- Search functionality
- Copy code buttons

---

## Publishing

### npm Package

- Name: `@oxog/json`
- Access: public
- Files: `dist/`

### Exports

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./plugins": {
      "import": "./dist/plugins/index.js",
      "require": "./dist/plugins/index.cjs",
      "types": "./dist/plugins/index.d.ts"
    }
  }
}
```
