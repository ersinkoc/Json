# @oxog/json - Zero-Dependency NPM Package

## Package Identity

| Field | Value |
|-------|-------|
| **NPM Package** | `@oxog/json` |
| **GitHub Repository** | `https://github.com/ersinkoc/json` |
| **Documentation Site** | `https://json.oxog.dev` |
| **License** | MIT |
| **Author** | Ersin Koç (ersinkoc) |

> **NO social media, Discord, email, or external links allowed.**

---

## Package Description

**One-line:** Zero-dependency, plugin-based JSON Swiss Army Knife for TypeScript — parse, query, transform, diff, validate, stream, and repair JSON with a single import.

@oxog/json is a comprehensive JSON toolkit that replaces dozens of single-purpose packages (lodash get/set, fast-json-stringify, jsonpath-plus, json-diff, ajv, etc.) with a unified, type-safe, micro-kernel architecture. Every feature is a plugin — load only what you need or use presets for full power. Designed for Node.js, browsers, and edge runtimes with zero runtime dependencies.

---

## NON-NEGOTIABLE RULES

These rules are **ABSOLUTE** and must be followed without exception.

### 1. ZERO RUNTIME DEPENDENCIES

```json
{
  "dependencies": {}  // MUST BE EMPTY - NO EXCEPTIONS
}
```

- Implement EVERYTHING from scratch
- No lodash, no ajv, no fast-json-stringify - nothing
- Write your own utilities, parsers, validators, JSONPath engine
- If you think you need a dependency, you don't

**Allowed devDependencies only:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "tsup": "^8.0.0",
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "eslint": "^9.0.0"
  }
}
```

### 2. 100% TEST COVERAGE

- Every line of code must be tested
- Every branch must be tested
- Every function must be tested
- **All tests must pass** (100% success rate)
- Use Vitest for testing
- Coverage thresholds enforced in config

### 3. MICRO-KERNEL ARCHITECTURE

All functionality MUST use plugin-based architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                        User Code                              │
│  json.parse() · json.get() · json.merge() · json.validate() │
├──────────────────────────────────────────────────────────────┤
│                    Plugin Registry API                         │
│          use() · register() · unregister() · list()           │
│                preset.full · preset.minimal                    │
├─────────┬─────────┬────────────┬─────────────┬───────────────┤
│  parse  │stringify│   query    │  transform  │    schema     │
│ (core)  │ (core)  │  (core)    │ (optional)  │  (optional)   │
├─────────┴─────────┴────────────┴─────────────┴───────────────┤
│                       Micro Kernel                             │
│     Event Bus · Plugin Lifecycle · Error Boundary · Config    │
└──────────────────────────────────────────────────────────────┘
```

**Kernel responsibilities (minimal):**
- Plugin registration and lifecycle management
- Event bus for inter-plugin communication
- Error boundary and recovery
- Configuration management
- Preset management (full, minimal, custom)

### 4. DEVELOPMENT WORKFLOW

Create these documents **FIRST**, before any code:

1. **SPECIFICATION.md** - Complete package specification
2. **IMPLEMENTATION.md** - Architecture and design decisions
3. **TASKS.md** - Ordered task list with dependencies

Only after all three documents are complete, implement code following TASKS.md sequentially.

### 5. TYPESCRIPT STRICT MODE

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

### 6. LLM-NATIVE DESIGN

Package must be designed for both humans AND AI assistants:

- **llms.txt** file in root (< 2000 tokens)
- **Predictable API** naming (`parse`, `stringify`, `get`, `set`, `use`, `merge`, `diff`, `validate`)
- **Rich JSDoc** with @example on every public API
- **18+ examples** organized by category
- **README** optimized for LLM consumption

### 7. NO EXTERNAL LINKS

- ✅ GitHub repository URL
- ✅ Custom domain (json.oxog.dev)
- ✅ npm package URL
- ❌ Social media (Twitter, LinkedIn, etc.)
- ❌ Discord/Slack links
- ❌ Email addresses
- ❌ Donation/sponsor links

---

## CORE FEATURES

### 1. Parse & Serialize (Core Plugin: `parse`)

High-performance JSON parsing with error recovery and advanced features.

**API Example:**
```typescript
import { json } from '@oxog/json';

// Basic parse (drop-in JSON.parse replacement)
const data = json.parse('{"name": "test", "value": 42}');

// Parse with reviver
const data2 = json.parse(jsonStr, {
  reviver: (key, value) => key === 'date' ? new Date(value) : value
});

// Safe parse (returns Result type, never throws)
const result = json.safeParse('{"valid": true}');
// { ok: true, value: { valid: true } }

const result2 = json.safeParse('{broken json');
// { ok: false, error: JsonParseError }
```

### 2. Stringify (Core Plugin: `stringify`)

Advanced JSON serialization with circular reference handling.

**API Example:**
```typescript
// Basic stringify
const str = json.stringify({ name: 'test' });

// Pretty print with indentation
const pretty = json.stringify(data, { indent: 2 });

// Handle circular references (instead of throwing)
const obj: any = { a: 1 };
obj.self = obj;
const safe = json.stringify(obj, { circular: '[Circular]' });
// '{"a":1,"self":"[Circular]"}'

// Custom replacer
const filtered = json.stringify(data, {
  replacer: (key, value) => key === 'password' ? undefined : value
});

// Sorted keys (deterministic output)
const sorted = json.stringify(data, { sortKeys: true });
```

### 3. Query & Traverse (Core Plugin: `query`)

Deep property access with dot notation, bracket notation, and wildcards.

**API Example:**
```typescript
const data = { users: [{ name: 'Alice', address: { city: 'NYC' } }] };

// Deep get
json.get(data, 'users[0].name');           // 'Alice'
json.get(data, 'users[0].address.city');   // 'NYC'
json.get(data, 'users[1].name', 'default'); // 'default' (with fallback)

// Deep set (returns new object, immutable by default)
const updated = json.set(data, 'users[0].name', 'Bob');

// Deep has
json.has(data, 'users[0].address.city');   // true
json.has(data, 'users[0].phone');          // false

// Deep delete
const cleaned = json.remove(data, 'users[0].address');

// List all paths (flattened keys)
const paths = json.paths(data);
// ['users', 'users[0]', 'users[0].name', 'users[0].address', 'users[0].address.city']
```

### 4. JSONPath Engine (Optional Plugin: `path`)

Full JSONPath expression support for complex queries.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { path } from '@oxog/json/plugins';

json.use(path);

const data = {
  store: {
    books: [
      { title: 'Book A', price: 10, category: 'fiction' },
      { title: 'Book B', price: 25, category: 'science' },
      { title: 'Book C', price: 8, category: 'fiction' }
    ]
  }
};

// JSONPath queries
json.query(data, '$.store.books[*].title');
// ['Book A', 'Book B', 'Book C']

json.query(data, '$.store.books[?(@.price < 15)]');
// [{ title: 'Book A', price: 10, ... }, { title: 'Book C', price: 8, ... }]

json.query(data, '$.store.books[?(@.category == "science")].title');
// ['Book B']
```

### 5. Transform (Optional Plugin: `transform`)

Deep merge, flatten, unflatten, sort, map, filter, pick, omit operations.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { transform } from '@oxog/json/plugins';

json.use(transform);

// Deep merge (multiple objects)
const merged = json.merge(
  { a: 1, b: { c: 2 } },
  { b: { d: 3 }, e: 4 }
);
// { a: 1, b: { c: 2, d: 3 }, e: 4 }

// Flatten nested object
const flat = json.flatten({ a: { b: { c: 1 } }, d: 2 });
// { 'a.b.c': 1, 'd': 2 }

// Unflatten
const nested = json.unflatten({ 'a.b.c': 1, 'd': 2 });
// { a: { b: { c: 1 } }, d: 2 }

// Pick specific paths
const picked = json.pick(data, ['name', 'email']);

// Omit specific paths
const omitted = json.omit(data, ['password', 'token']);

// Sort keys (deep, recursive)
const sorted = json.sortKeys(data);

// Map values (recursive)
const mapped = json.mapValues(data, (value) =>
  typeof value === 'string' ? value.trim() : value
);

// Filter entries (recursive)
const filtered = json.filterValues(data, (value) => value !== null);
```

### 6. Diff & Patch (Optional Plugins: `diff` + `patch`)

Generate RFC 6902 JSON Patch documents and apply them.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { diff, patch } from '@oxog/json/plugins';

json.use(diff, patch);

const before = { name: 'Alice', age: 30, city: 'NYC' };
const after = { name: 'Alice', age: 31, city: 'LA', email: 'a@b.com' };

// Generate diff (RFC 6902 JSON Patch format)
const changes = json.diff(before, after);
// [
//   { op: 'replace', path: '/age', value: 31 },
//   { op: 'replace', path: '/city', value: 'LA' },
//   { op: 'add', path: '/email', value: 'a@b.com' }
// ]

// Apply patch
const result = json.patch(before, changes);
// { name: 'Alice', age: 31, city: 'LA', email: 'a@b.com' }

// Validate patch
const valid = json.validatePatch(changes);
// { valid: true }

// Reverse patch (undo)
const reversePatch = json.reverseDiff(changes, before);
```

### 7. Schema Validation (Optional Plugin: `schema`)

JSON Schema validation (draft-07 compatible) with type guard generation.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { schema } from '@oxog/json/plugins';

json.use(schema);

const userSchema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0 }
  },
  additionalProperties: false
};

// Validate
const check = json.validate(data, userSchema);
// { valid: true }

// Validation with errors
const check2 = json.validate({ name: '' }, userSchema);
// { valid: false, errors: [
//   { path: '/name', message: 'String must have minimum length of 1', keyword: 'minLength' },
//   { path: '/email', message: 'Required property missing', keyword: 'required' }
// ]}

// Compile schema for repeated use (performance)
const validateUser = json.compile(userSchema);
const result = validateUser(data);

// TypeScript type guard
if (json.is(data, userSchema)) {
  // data is typed as { name: string, email: string, age?: number }
}
```

### 8. Streaming (Optional Plugin: `stream`)

Streaming JSON parse/stringify for large files, JSONL/NDJSON support.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { stream } from '@oxog/json/plugins';

json.use(stream);

// Stream parse large JSON array
const readable = fs.createReadStream('large-file.json');
for await (const item of json.stream.parse(readable)) {
  console.log(item); // Each array element streamed
}

// Stream stringify (write large data without memory spike)
const writable = fs.createWriteStream('output.json');
await json.stream.stringify(largeArray, writable);

// JSONL/NDJSON parsing
const lines = fs.createReadStream('data.jsonl');
for await (const line of json.stream.parseLines(lines)) {
  console.log(line); // Each line parsed as JSON
}

// JSONL/NDJSON writing
const outLines = fs.createWriteStream('output.jsonl');
await json.stream.stringifyLines(dataArray, outLines);
```

### 9. Repair (Optional Plugin: `repair`)

Fix malformed/broken JSON automatically.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { repair } from '@oxog/json/plugins';

json.use(repair);

// Fix trailing commas
json.repair('{"a": 1, "b": 2,}');
// '{"a": 1, "b": 2}'

// Fix single quotes
json.repair("{'name': 'test'}");
// '{"name": "test"}'

// Fix unquoted keys
json.repair('{name: "test", value: 42}');
// '{"name": "test", "value": 42}'

// Strip comments (JS-style)
json.repair('{ /* comment */ "a": 1 // inline\n}');
// '{"a": 1}'

// Fix missing quotes on values
json.repair('{"status": active}');
// '{"status": "active"}'

// Combined: fix multiple issues at once
json.repair("{name: 'test', items: [1, 2, 3,], /* todo */ }");
// '{"name": "test", "items": [1, 2, 3]}'
```

### 10. JSON5 Support (Optional Plugin: `json5`)

Full JSON5 parsing and serialization (comments, trailing commas, unquoted keys, etc.)

**API Example:**
```typescript
import { json } from '@oxog/json';
import { json5 } from '@oxog/json/plugins';

json.use(json5);

// Parse JSON5
const config = json.parse5(`{
  // Database configuration
  host: 'localhost',
  port: 5432,
  ssl: true,
  /* Connection pool settings */
  pool: {
    min: 2,
    max: 10,
  }, // trailing comma OK
}`);

// Stringify as JSON5
const str = json.stringify5(config, { indent: 2, quote: "'" });
```

### 11. Type Inference (Optional Plugin: `type`)

Generate TypeScript type definitions from JSON data.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { type } from '@oxog/json/plugins';

json.use(type);

const data = {
  name: 'Alice',
  age: 30,
  active: true,
  tags: ['admin', 'user'],
  address: { city: 'NYC', zip: '10001' }
};

// Generate TypeScript interface
const ts = json.infer(data, { name: 'User' });
// interface User {
//   name: string;
//   age: number;
//   active: boolean;
//   tags: string[];
//   address: {
//     city: string;
//     zip: string;
//   };
// }

// Infer from multiple samples (union types)
const ts2 = json.infer([sample1, sample2, sample3], { name: 'ApiResponse' });
```

### 12. Immutable Mode (Optional Plugin: `immutable`)

Deep freeze objects with structural sharing for efficient updates.

**API Example:**
```typescript
import { json } from '@oxog/json';
import { immutable } from '@oxog/json/plugins';

json.use(immutable);

// Deep freeze
const frozen = json.freeze({ a: { b: { c: 1 } } });
// frozen.a.b.c = 2; // TypeError: Cannot assign to read only property

// Immutable set (structural sharing - only changed paths are new objects)
const updated = json.immutableSet(frozen, 'a.b.c', 2);
// updated.a.b.c === 2
// updated.a !== frozen.a (new reference)
// Other unchanged branches share references

// Clone (deep copy)
const clone = json.clone(data);
```

### 13. CLI Tool

Command-line interface for JSON operations.

**CLI Examples:**
```bash
# Format / pretty print
npx @oxog/json format input.json
npx @oxog/json format input.json --indent 4
npx @oxog/json format input.json -o output.json

# Minify
npx @oxog/json minify input.json

# Query with dot notation
npx @oxog/json get input.json "users[0].name"

# Query with JSONPath
npx @oxog/json query input.json "$.store.books[?(@.price < 15)].title"

# Diff two files
npx @oxog/json diff before.json after.json
npx @oxog/json diff before.json after.json --format rfc6902

# Validate against schema
npx @oxog/json validate data.json --schema schema.json

# Repair broken JSON
npx @oxog/json repair broken.json
npx @oxog/json repair broken.json -o fixed.json

# Type inference
npx @oxog/json infer data.json --name UserType
npx @oxog/json infer data.json --name UserType -o types.ts

# Flatten/Unflatten
npx @oxog/json flatten input.json
npx @oxog/json unflatten input.json

# Stream large files (JSONL)
npx @oxog/json lines input.jsonl --filter "$.status == 'active'"

# Merge multiple files
npx @oxog/json merge a.json b.json c.json -o merged.json

# Pipe support
cat data.json | npx @oxog/json format
echo '{"a":1}' | npx @oxog/json get "a"
```

---

## PLUGIN SYSTEM

### Plugin Interface

```typescript
/**
 * Plugin interface for extending @oxog/json kernel functionality.
 *
 * @typeParam TContext - Shared context type between plugins
 *
 * @example
 * ```typescript
 * const myPlugin: JsonPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   install: (kernel) => {
 *     kernel.register('myMethod', (data) => transform(data));
 *   }
 * };
 * json.use(myPlugin);
 * ```
 */
export interface JsonPlugin<TContext = unknown> {
  /** Unique plugin identifier (kebab-case) */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Other plugins this plugin depends on */
  dependencies?: string[];

  /**
   * Called when plugin is registered.
   * @param kernel - The kernel instance
   */
  install: (kernel: JsonKernel<TContext>) => void;

  /**
   * Called after all plugins are installed.
   * @param context - Shared context object
   */
  onInit?: (context: TContext) => void | Promise<void>;

  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void | Promise<void>;

  /**
   * Called on error in this plugin.
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}
```

### Core Plugins (Always Loaded)

| Plugin | Description |
|--------|-------------|
| `parse` | JSON parsing with safe mode, reviver support, and error recovery |
| `stringify` | JSON serialization with circular reference handling, sorted keys, pretty print |
| `query` | Deep get/set/has/remove with dot notation and bracket notation |

### Optional Plugins (Opt-in)

| Plugin | Description | Enable |
|--------|-------------|--------|
| `path` | JSONPath expression engine for complex queries | `json.use(path)` |
| `transform` | merge, flatten, unflatten, pick, omit, sort, map, filter | `json.use(transform)` |
| `diff` | Generate RFC 6902 JSON Patch between two objects | `json.use(diff)` |
| `patch` | Apply RFC 6902 JSON Patch operations | `json.use(patch)` |
| `schema` | JSON Schema validation (draft-07), compile, type guards | `json.use(schema)` |
| `stream` | Streaming parse/stringify, JSONL/NDJSON support | `json.use(stream)` |
| `repair` | Fix malformed JSON (trailing commas, comments, unquoted keys) | `json.use(repair)` |
| `json5` | JSON5 parse/stringify (comments, trailing commas, etc.) | `json.use(json5)` |
| `type` | TypeScript type inference from JSON data | `json.use(type)` |
| `immutable` | Deep freeze, structural sharing, immutable updates | `json.use(immutable)` |

### Presets

```typescript
import { json } from '@oxog/json';
import { preset } from '@oxog/json/plugins';

// Load everything
json.use(preset.full);

// Load minimal (core + transform + repair)
json.use(preset.minimal);

// Load specific combination
json.use(preset.validation); // schema + type
json.use(preset.processing); // transform + diff + patch + stream

// Custom preset
const myPreset = json.createPreset([transform, diff, schema]);
json.use(myPreset);
```

---

## API DESIGN

### Main Export — Hybrid Pattern

```typescript
// === Singleton (default instance, zero config) ===
import { json } from '@oxog/json';

json.parse('{"a": 1}');
json.stringify({ a: 1 });
json.get(data, 'path.to.value');
json.use(transform, diff, schema);

// === Factory (custom instances) ===
import { createJson } from '@oxog/json';

const myJson = createJson({
  // Parse options
  parse: {
    strict: true,        // Reject non-standard JSON
    maxDepth: 100,       // Maximum nesting depth
    maxLength: 10_000_000 // Maximum input length
  },
  // Stringify options
  stringify: {
    indent: 2,           // Default indentation
    sortKeys: false,     // Sort object keys
    circular: undefined  // Circular reference replacement
  },
  // Plugin options
  plugins: [transform, schema],
  // Error handling
  onError: (error) => console.error(error)
});

// myJson has same API as singleton but with custom config
myJson.parse(str);
myJson.get(data, 'path');
```

### Core Type Definitions

```typescript
/** Result type for safe operations (parse, validate) */
export type JsonResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: JsonError };

/** Any valid JSON value */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** JSON object type */
export type JsonObject = { [key: string]: JsonValue };

/** JSON array type */
export type JsonArray = JsonValue[];

/** Dot-notation path string */
export type JsonPath = string;

/** RFC 6902 JSON Patch operation */
export type JsonPatchOp =
  | { op: 'add'; path: string; value: JsonValue }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: JsonValue }
  | { op: 'move'; from: string; path: string }
  | { op: 'copy'; from: string; path: string }
  | { op: 'test'; path: string; value: JsonValue };

/** JSON Schema validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/** Schema validation error detail */
export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params?: Record<string, unknown>;
}

/** Parse options */
export interface ParseOptions {
  /** Custom reviver function */
  reviver?: (key: string, value: unknown) => unknown;
  /** Maximum nesting depth (default: 512) */
  maxDepth?: number;
  /** Maximum input string length (default: 10MB) */
  maxLength?: number;
  /** Strict mode - reject non-standard JSON (default: false) */
  strict?: boolean;
}

/** Stringify options */
export interface StringifyOptions {
  /** Indentation spaces or string (default: undefined = minified) */
  indent?: number | string;
  /** Custom replacer function */
  replacer?: (key: string, value: unknown) => unknown;
  /** Handle circular references (default: throws) */
  circular?: string | false;
  /** Sort object keys alphabetically (default: false) */
  sortKeys?: boolean;
}

/** @oxog/json kernel configuration */
export interface JsonConfig {
  parse?: ParseOptions;
  stringify?: StringifyOptions;
  plugins?: JsonPlugin[];
  onError?: (error: JsonError) => void;
}
```

### CLI Interface

```bash
# Global install or npx
npx @oxog/json <command> [options] [file]

# Commands:
#   format    Pretty print JSON
#   minify    Minify JSON
#   get       Get value by path
#   query     JSONPath query
#   diff      Compare two JSON files
#   patch     Apply JSON patch
#   validate  Validate against schema
#   repair    Fix broken JSON
#   infer     Generate TypeScript types
#   flatten   Flatten nested JSON
#   unflatten Unflatten dotted keys
#   merge     Deep merge multiple files
#   lines     Process JSONL/NDJSON

# Global options:
#   -o, --output <file>  Output file (default: stdout)
#   -i, --indent <n>     Indentation (default: 2)
#   -h, --help           Show help
#   -v, --version        Show version
#   --no-color           Disable colored output
```

---

## TECHNICAL REQUIREMENTS

| Requirement | Value |
|-------------|-------|
| Runtime | Universal (Node.js 18+, modern browsers, Deno, Bun, Edge) |
| Module Format | ESM + CJS (dual build via tsup) |
| Node.js Version | >= 18 |
| TypeScript Version | >= 5.0 |
| Bundle Size (core kernel) | < 5KB gzipped |
| Bundle Size (core plugins) | < 10KB gzipped |
| Bundle Size (all plugins) | < 15KB gzipped |
| Test Coverage | 100% lines, branches, functions, statements |

---

## LLM-NATIVE REQUIREMENTS

### 1. llms.txt File

Create `/llms.txt` in project root (< 2000 tokens):

```markdown
# @oxog/json

> Zero-dependency JSON Swiss Army Knife — parse, query, transform, diff, validate, stream, repair

## Install

npm install @oxog/json

## Basic Usage

import { json } from '@oxog/json';
const data = json.parse('{"name": "test"}');
const val = json.get(data, 'name'); // 'test'
json.stringify(data, { indent: 2 });

## API Summary

### Core (always available)
- `json.parse(str, opts?)` - Parse JSON string
- `json.safeParse(str, opts?)` - Parse without throwing (returns Result)
- `json.stringify(value, opts?)` - Serialize to JSON string
- `json.get(obj, path, fallback?)` - Deep get by dot path
- `json.set(obj, path, value)` - Deep set (returns new object)
- `json.has(obj, path)` - Check if path exists
- `json.remove(obj, path)` - Remove value at path
- `json.paths(obj)` - List all dot-notation paths

### Optional Plugins
- `path` - JSONPath queries: `json.query(data, '$.books[*].title')`
- `transform` - merge, flatten, unflatten, pick, omit, sortKeys, mapValues, filterValues
- `diff` - `json.diff(a, b)` → RFC 6902 patch array
- `patch` - `json.patch(obj, ops)` → patched object
- `schema` - `json.validate(data, schema)` → { valid, errors }
- `stream` - `json.stream.parse(readable)`, `json.stream.parseLines(readable)`
- `repair` - `json.repair(brokenStr)` → fixed JSON string
- `json5` - `json.parse5(str)`, `json.stringify5(data)`
- `type` - `json.infer(data, { name })` → TypeScript interface string
- `immutable` - `json.freeze(obj)`, `json.immutableSet(obj, path, val)`

### Plugin Loading
import { transform, diff, schema } from '@oxog/json/plugins';
json.use(transform, diff, schema);
// Or: json.use(preset.full) for everything

### Factory (custom config)
import { createJson } from '@oxog/json';
const j = createJson({ parse: { maxDepth: 50 }, plugins: [schema] });

## Errors
| Code | Meaning |
| JSON_PARSE_ERROR | Invalid JSON input |
| JSON_PATH_ERROR | Invalid path expression |
| JSON_SCHEMA_ERROR | Schema validation failed |
| JSON_PATCH_ERROR | Invalid patch operation |
| PLUGIN_ERROR | Plugin operation failed |
| MAX_DEPTH_ERROR | Nesting depth exceeded |

## Links
- Docs: https://json.oxog.dev
- GitHub: https://github.com/ersinkoc/json
```

### 2. API Naming Standards

Use predictable patterns LLMs can infer:

```typescript
// ✅ GOOD - Predictable, standard naming
json.parse()          // Parse string to value
json.safeParse()      // Parse without throwing
json.stringify()      // Value to string
json.get()            // Read by path
json.set()            // Write by path
json.has()            // Check existence
json.remove()         // Delete by path
json.merge()          // Deep merge
json.diff()           // Compare two objects
json.patch()          // Apply operations
json.validate()       // Check against schema
json.repair()         // Fix broken JSON
json.flatten()        // Nested → flat
json.unflatten()      // Flat → nested
json.use()            // Register plugin
json.query()          // JSONPath query

// ❌ BAD - Unpredictable
json.p()              // What is this?
json.x()              // ???
json.proc()           // Abbreviation
json.handle()         // Vague
```

### 3. Example Richness (18+ examples)

```
examples/
├── 01-basic/
│   ├── parse-stringify.ts      # Basic parse/stringify
│   ├── safe-parse.ts           # Error-safe parsing
│   └── circular-refs.ts        # Circular reference handling
├── 02-query/
│   ├── dot-notation.ts         # Deep get/set/has/remove
│   ├── jsonpath.ts             # JSONPath queries
│   └── paths-listing.ts        # Enumerate all paths
├── 03-transform/
│   ├── merge.ts                # Deep merge objects
│   ├── flatten-unflatten.ts    # Flatten/unflatten
│   └── pick-omit.ts            # Pick/omit fields
├── 04-diff-patch/
│   ├── basic-diff.ts           # Generate diff
│   ├── apply-patch.ts          # Apply RFC 6902 patch
│   └── undo-changes.ts         # Reverse patch
├── 05-validation/
│   ├── basic-validate.ts       # Schema validation
│   ├── compiled-schema.ts      # Pre-compiled for performance
│   └── type-guards.ts          # TypeScript type guards
├── 06-streaming/
│   ├── large-files.ts          # Stream large JSON files
│   └── jsonl-processing.ts     # JSONL/NDJSON handling
├── 07-repair/
│   ├── fix-json.ts             # Auto-repair broken JSON
│   └── json5-config.ts         # JSON5 config files
├── 08-advanced/
│   ├── type-inference.ts       # Generate TS types
│   ├── immutable-data.ts       # Immutable operations
│   ├── custom-plugin.ts        # Create your own plugin
│   └── presets.ts              # Using presets
├── 09-integrations/
│   ├── express-middleware.ts   # Express.js body parser
│   ├── react-state.ts          # React state management
│   └── config-loader.ts        # App config loading
└── 10-real-world/
    ├── api-response-handler/   # Complete API response toolkit
    ├── config-manager/         # Config file management
    └── data-migration/         # JSON data migration pipeline
```

### 4. Type Documentation

Every public API must have:
- JSDoc with description
- @param for all parameters
- @returns with description
- @example with runnable code
- @default for optional parameters
- @throws for error conditions
- @see for related methods

```typescript
/**
 * Parse a JSON string into a JavaScript value.
 *
 * Enhanced drop-in replacement for `JSON.parse` with additional safety features
 * including depth limiting, length validation, and reviver support.
 *
 * @param text - The JSON string to parse
 * @param options - Parse configuration options
 * @returns The parsed JavaScript value
 * @throws {JsonParseError} When the input is not valid JSON
 * @throws {MaxDepthError} When nesting exceeds maxDepth
 *
 * @example
 * ```typescript
 * // Basic usage
 * const data = json.parse('{"name": "Alice", "age": 30}');
 * // { name: 'Alice', age: 30 }
 *
 * // With reviver
 * const data = json.parse(str, {
 *   reviver: (key, val) => key === 'date' ? new Date(val) : val
 * });
 * ```
 *
 * @see {@link safeParse} for non-throwing variant
 * @see {@link stringify} for the inverse operation
 */
export function parse(text: string, options?: ParseOptions): JsonValue;
```

---

## MCP SERVER

Create an MCP server for LLM integration at `mcp-server/`:

### Tools

| Tool | Description |
|------|-------------|
| `json_search_docs` | Search @oxog/json documentation |
| `json_get_example` | Get usage example for a feature |
| `json_api_reference` | Get API reference for a method |
| `json_validate_snippet` | Validate a JSON snippet |

### MCP Server Structure

```
mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # Server entry
│   ├── tools/
│   │   ├── search.ts   # Documentation search
│   │   ├── examples.ts # Example retrieval
│   │   ├── api.ts      # API reference
│   │   └── validate.ts # JSON validation
│   └── data/
│       ├── docs.json   # Searchable documentation
│       └── examples/   # Example files
└── README.md
```

---

## ERROR HANDLING

Custom error classes with codes for programmatic handling:

```typescript
export class JsonError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'JsonError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class JsonParseError extends JsonError {
  constructor(message: string, context?: { position?: number; line?: number; column?: number }) {
    super(message, 'JSON_PARSE_ERROR', context);
    this.name = 'JsonParseError';
  }
}

export class JsonPathError extends JsonError {
  constructor(message: string, context?: { path?: string; expression?: string }) {
    super(message, 'JSON_PATH_ERROR', context);
    this.name = 'JsonPathError';
  }
}

export class JsonSchemaError extends JsonError {
  constructor(message: string, context?: { schema?: unknown; errors?: unknown[] }) {
    super(message, 'JSON_SCHEMA_ERROR', context);
    this.name = 'JsonSchemaError';
  }
}

export class JsonPatchError extends JsonError {
  constructor(message: string, context?: { operation?: unknown; index?: number }) {
    super(message, 'JSON_PATCH_ERROR', context);
    this.name = 'JsonPatchError';
  }
}

export class MaxDepthError extends JsonError {
  constructor(maxDepth: number) {
    super(`Maximum nesting depth of ${maxDepth} exceeded`, 'MAX_DEPTH_ERROR', { maxDepth });
    this.name = 'MaxDepthError';
  }
}

export class PluginError extends JsonError {
  constructor(message: string, pluginName: string, context?: Record<string, unknown>) {
    super(message, 'PLUGIN_ERROR', { ...context, pluginName });
    this.name = 'PluginError';
  }
}
```

---

## PROJECT STRUCTURE

```
json/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Website deploy ONLY
├── src/
│   ├── index.ts                    # Main entry: json singleton, createJson factory
│   ├── kernel.ts                   # Micro kernel: plugin registry, event bus, lifecycle
│   ├── types.ts                    # All type definitions (JsonValue, Plugin, Config, etc.)
│   ├── errors.ts                   # Custom error classes
│   ├── plugins/
│   │   ├── index.ts                # Plugin exports + presets
│   │   ├── core/
│   │   │   ├── parse.plugin.ts     # JSON parse + safeParse
│   │   │   ├── stringify.plugin.ts # JSON stringify with options
│   │   │   └── query.plugin.ts     # Deep get/set/has/remove/paths
│   │   └── optional/
│   │       ├── path.plugin.ts      # JSONPath engine
│   │       ├── transform.plugin.ts # merge, flatten, pick, omit, etc.
│   │       ├── diff.plugin.ts      # JSON diff (RFC 6902)
│   │       ├── patch.plugin.ts     # JSON patch (RFC 6902)
│   │       ├── schema.plugin.ts    # JSON Schema validation
│   │       ├── stream.plugin.ts    # Streaming parse/stringify + JSONL
│   │       ├── repair.plugin.ts    # Broken JSON repair
│   │       ├── json5.plugin.ts     # JSON5 support
│   │       ├── type.plugin.ts      # TypeScript type inference
│   │       └── immutable.plugin.ts # Freeze + structural sharing
│   ├── cli/
│   │   ├── index.ts                # CLI entry point
│   │   ├── commands/               # One file per command
│   │   └── utils.ts                # CLI helpers (color, format)
│   └── utils/
│       ├── path-parser.ts          # Dot/bracket notation parser
│       ├── deep-clone.ts           # Deep clone utility
│       ├── type-checks.ts          # isObject, isArray, etc.
│       └── escape.ts               # String escaping utilities
├── tests/
│   ├── unit/
│   │   ├── kernel.test.ts
│   │   ├── parse.test.ts
│   │   ├── stringify.test.ts
│   │   ├── query.test.ts
│   │   ├── path.test.ts
│   │   ├── transform.test.ts
│   │   ├── diff.test.ts
│   │   ├── patch.test.ts
│   │   ├── schema.test.ts
│   │   ├── stream.test.ts
│   │   ├── repair.test.ts
│   │   ├── json5.test.ts
│   │   ├── type.test.ts
│   │   ├── immutable.test.ts
│   │   └── cli.test.ts
│   ├── integration/
│   │   ├── plugin-system.test.ts
│   │   ├── presets.test.ts
│   │   ├── factory.test.ts
│   │   └── end-to-end.test.ts
│   └── fixtures/
│       ├── valid/                  # Valid JSON test files
│       ├── invalid/                # Broken JSON for repair tests
│       ├── schemas/                # JSON Schema files
│       ├── large/                  # Large files for streaming tests
│       └── json5/                  # JSON5 test files
├── examples/                       # 18+ organized examples (see above)
├── mcp-server/                     # MCP server for LLM integration
├── website/                        # React + Vite docs site → json.oxog.dev
│   ├── public/
│   │   ├── CNAME                   # json.oxog.dev
│   │   ├── llms.txt                # Copied from root
│   │   ├── favicon.svg
│   │   └── og-image.png
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── code/
│   │   │   │   ├── CodeBlock.tsx   # IDE-style @oxog/codeshine wrapper
│   │   │   │   └── CodePreview.tsx
│   │   │   ├── home/
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   └── Stats.tsx
│   │   │   └── common/
│   │   │       ├── ThemeToggle.tsx
│   │   │       ├── CopyButton.tsx
│   │   │       ├── GitHubStar.tsx
│   │   │       ├── InstallTabs.tsx
│   │   │       └── SearchDialog.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── docs/
│   │   │   ├── api/
│   │   │   ├── Examples.tsx
│   │   │   ├── Plugins.tsx
│   │   │   └── Playground.tsx
│   │   ├── hooks/
│   │   │   ├── useTheme.ts
│   │   │   └── useClipboard.ts
│   │   └── lib/
│   │       ├── utils.ts
│   │       └── constants.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── components.json
│   ├── tsconfig.json
│   └── package.json
├── llms.txt
├── SPECIFICATION.md
├── IMPLEMENTATION.md
├── TASKS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── .gitignore
```

---

## WEBSITE SPECIFICATION

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 6.x | Build Tool |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling (CSS-first config) |
| shadcn/ui | latest | UI Components |
| @oxog/codeshine | latest | Syntax Highlighting |
| Lucide React | latest | Icons |
| React Router | 7.x | Routing |

### Font Requirements

- **Body Text**: Inter
- **Code/Monospace**: JetBrains Mono

### @oxog/codeshine Integration

All code blocks must use @oxog/codeshine with:
- IDE-style window chrome (macOS traffic light dots)
- Dark/Light theme sync (github-dark / github-light)
- Line numbers, copy button, language badge
- Filename display
- Line highlighting support

### Required Pages

1. **Landing Page** — Hero, install tabs, features grid, quick example, stats
2. **Docs** — Sidebar navigation, ToC, breadcrumbs, prev/next
3. **API Reference** — All public functions, TypeScript signatures, examples
4. **Examples** — Categorized, copy-paste ready, expected output
5. **Plugins** — Core/optional lists, how to create custom plugins, lifecycle diagram
6. **Playground** — Live code editor with output preview

### Footer

```
Made with ❤️ by Ersin KOÇ | GitHub | npm | v1.0.0 | MIT License
```

### CNAME

```
json.oxog.dev
```

---

## GITHUB ACTIONS

Single workflow file: `.github/workflows/deploy.yml`

```yaml
name: Deploy Website

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Build package
        run: npm run build

      - name: Build website
        working-directory: ./website
        run: |
          npm ci
          npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './website/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## CONFIG FILES

### tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
  },
  {
    entry: ['src/plugins/index.ts'],
    outDir: 'dist/plugins',
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    minify: false,
  },
  {
    entry: ['src/cli/index.ts'],
    outDir: 'dist/cli',
    format: ['esm'],
    banner: { js: '#!/usr/bin/env node' },
    sourcemap: true,
    treeshake: true,
    minify: false,
  }
]);
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'website/',
        'examples/',
        'mcp-server/',
        '*.config.*',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
```

### package.json

```json
{
  "name": "@oxog/json",
  "version": "1.0.0",
  "description": "Zero-dependency JSON Swiss Army Knife — parse, query, transform, diff, validate, stream, and repair with micro-kernel plugin architecture",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "oxog-json": "./dist/cli/index.js"
  },
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./plugins": {
      "import": {
        "types": "./dist/plugins/index.d.ts",
        "default": "./dist/plugins/index.js"
      },
      "require": {
        "types": "./dist/plugins/index.d.cts",
        "default": "./dist/plugins/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test:coverage"
  },
  "keywords": [
    "json",
    "parse",
    "stringify",
    "query",
    "jsonpath",
    "diff",
    "patch",
    "merge",
    "schema",
    "validate",
    "stream",
    "repair",
    "zero-dependency",
    "typescript",
    "plugin",
    "micro-kernel"
  ],
  "author": "Ersin Koç",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ersinkoc/json.git"
  },
  "bugs": {
    "url": "https://github.com/ersinkoc/json/issues"
  },
  "homepage": "https://json.oxog.dev",
  "engines": {
    "node": ">=18"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

---

## IMPLEMENTATION CHECKLIST

### Before Starting
- [ ] Create SPECIFICATION.md with complete spec
- [ ] Create IMPLEMENTATION.md with architecture
- [ ] Create TASKS.md with ordered task list
- [ ] All three documents reviewed and complete

### During Implementation
- [ ] Follow TASKS.md sequentially
- [ ] Write tests before or with each feature
- [ ] Maintain 100% coverage throughout
- [ ] JSDoc on every public API with @example
- [ ] Create examples as features are built

### Package Completion
- [ ] All tests passing (100%)
- [ ] Coverage at 100% (lines, branches, functions)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Package builds without errors
- [ ] CLI works correctly

### LLM-Native Completion
- [ ] llms.txt created (< 2000 tokens)
- [ ] llms.txt copied to website/public/
- [ ] README first 500 tokens optimized
- [ ] All public APIs have JSDoc + @example
- [ ] 18+ examples in organized folders
- [ ] package.json has 16 keywords
- [ ] API uses standard naming patterns
- [ ] MCP server implemented

### Website Completion
- [ ] All pages implemented (Home, Docs, API, Examples, Plugins, Playground)
- [ ] IDE-style code blocks with @oxog/codeshine + theme sync
- [ ] Dark/Light theme toggle
- [ ] CNAME file with json.oxog.dev
- [ ] Mobile responsive
- [ ] Footer: "Made with ❤️ by Ersin KOÇ"
- [ ] GitHub link → ersinkoc/json
- [ ] Lighthouse score > 90

### Final Verification
- [ ] `npm run build` succeeds
- [ ] `npm run test:coverage` shows 100%
- [ ] Website builds without errors
- [ ] All examples run successfully
- [ ] CLI commands work correctly
- [ ] README is complete and accurate
- [ ] MCP server functional

---

## BEGIN IMPLEMENTATION

Start by creating **SPECIFICATION.md** with the complete package specification based on everything above.

Then create **IMPLEMENTATION.md** with architecture decisions.

Then create **TASKS.md** with ordered, numbered tasks.

Only after all three documents are complete, begin implementing code by following TASKS.md sequentially.

**Remember:**
- This package will be published to npm as `@oxog/json`
- It must be production-ready
- Zero runtime dependencies — implement EVERYTHING from scratch
- 100% test coverage
- Professionally documented
- LLM-native design with llms.txt and MCP server
- Beautiful documentation website at json.oxog.dev
- CLI tool accessible via `npx @oxog/json`
