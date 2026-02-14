# @oxog/json Implementation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Code                                │
│   json.parse() · json.get() · json.merge() · json.validate()    │
├─────────────────────────────────────────────────────────────────┤
│                      Plugin Registry API                          │
│            use() · register() · unregister() · list()            │
│                  preset.full · preset.minimal                     │
├─────────┬─────────┬──────────┬─────────────┬────────────────────┤
│  parse  │stringify│  query   │  transform  │      schema        │
│ (core)  │ (core)  │ (core)   │ (optional)  │    (optional)      │
├─────────┴─────────┴──────────┴─────────────┴────────────────────┤
│                        Micro Kernel                               │
│   Event Bus · Plugin Lifecycle · Error Boundary · Configuration  │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### 1. Micro-Kernel Pattern

**Decision**: Use a micro-kernel architecture where all functionality is delivered through plugins.

**Rationale**:
- Minimal core footprint (< 5KB gzipped)
- Users load only what they need
- Easy to extend with custom plugins
- Clear separation of concerns

**Implementation**:
```typescript
class JsonKernel {
  private plugins: Map<string, JsonPlugin> = new Map();
  private methods: Map<string, Function> = new Map();
  private events: EventEmitter;
  private config: JsonConfig;
  
  use(...plugins: JsonPlugin[]): void;
  register(name: string, method: Function): void;
  emit(event: string, data: unknown): void;
}
```

### 2. Singleton + Factory Pattern

**Decision**: Export both a default singleton and a factory function.

**Rationale**:
- Singleton for zero-config usage
- Factory for custom configurations
- Same API surface for both

**Implementation**:
```typescript
// Default singleton
export const json = createJson();

// Factory for custom instances
export function createJson(config?: JsonConfig): JsonKernel;
```

### 3. Immutable Operations

**Decision**: All operations that modify data return new objects.

**Rationale**:
- Predictable behavior
- No side effects
- Safe for React/Redux
- Enables structural sharing

**Implementation**:
```typescript
function set(obj: unknown, path: string, value: unknown): unknown {
  // Deep clone only the path that changes
  // Return new object with structural sharing
}
```

### 4. Result Type for Safe Operations

**Decision**: Use Result type for operations that might fail.

**Rationale**:
- No exceptions for expected failures
- Explicit error handling
- Type-safe error checking

**Implementation**:
```typescript
type JsonResult<T> = 
  | { ok: true; value: T }
  | { ok: false; error: JsonError };

function safeParse(text: string): JsonResult<JsonValue> {
  try {
    return { ok: true, value: parse(text) };
  } catch (e) {
    return { ok: false, error: new JsonParseError(e.message) };
  }
}
```

### 5. Custom Parser Implementation

**Decision**: Implement JSON parser from scratch.

**Rationale**:
- Zero dependencies requirement
- Add features like depth limiting
- Better error messages with position info
- Foundation for JSON5 and repair plugins

**Implementation**:
```typescript
class Parser {
  private pos: number = 0;
  private depth: number = 0;
  
  parse(text: string): JsonValue {
    this.text = text;
    this.pos = 0;
    return this.parseValue();
  }
  
  private parseValue(): JsonValue {
    this.skipWhitespace();
    const ch = this.peek();
    
    if (ch === '{') return this.parseObject();
    if (ch === '[') return this.parseArray();
    if (ch === '"') return this.parseString();
    // ... etc
  }
}
```

### 6. Path Parser Design

**Decision**: Support both dot and bracket notation in a single parser.

**Rationale**:
- User-friendly API
- Compatible with lodash-style paths
- JSONPointer compatible

**Implementation**:
```typescript
function parsePath(path: string): (string | number)[] {
  const segments: (string | number)[] = [];
  let i = 0;
  
  while (i < path.length) {
    if (path[i] === '.') {
      i++;
      // Parse identifier
    } else if (path[i] === '[') {
      i++;
      // Parse bracket notation
    }
  }
  
  return segments;
}
```

### 7. JSONPath Engine

**Decision**: Implement subset of JSONPath that covers 95% of use cases.

**Rationale**:
- Full spec is complex
- Most users need basic queries
- Keeps bundle size small

**Supported Expressions**:
- `$` - root
- `.property` - child
- `[n]` - array index
- `[*]` - wildcard
- `[n:m]` - slice
- `[?expr]` - filter
- `..property` - recursive descent

**Implementation**:
```typescript
function query(data: unknown, expr: string): unknown[] {
  const tokens = tokenize(expr);
  return evaluate(data, tokens);
}
```

### 8. Schema Validation Strategy

**Decision**: Implement JSON Schema draft-07 from scratch.

**Rationale**:
- Zero dependencies
- Full control over validation
- Can optimize for common cases

**Implementation**:
```typescript
interface SchemaValidator {
  validate(data: unknown, schema: JsonSchema): ValidationResult;
  compile(schema: JsonSchema): (data: unknown) => ValidationResult;
}

// Keyword-based validation
const keywords = {
  type: validateType,
  enum: validateEnum,
  const: validateConst,
  minLength: validateMinLength,
  // ... etc
};
```

### 9. Streaming Implementation

**Decision**: Support both Web Streams and Node.js streams.

**Rationale**:
- Universal runtime support
- Modern API with fallbacks

**Implementation**:
```typescript
async function* streamParse(source: ReadableStream | NodeReadable): AsyncGenerator<unknown> {
  const reader = 'getReader' in source 
    ? source.getReader() 
    : NodeStreamToReader(source);
  
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += value;
    yield* extractCompleteItems(buffer);
  }
}
```

### 10. Error Handling

**Decision**: Custom error hierarchy with error codes.

**Rationale**:
- Programmatic error handling
- Clear error types
- Additional context

**Implementation**:
```typescript
abstract class JsonError extends Error {
  abstract readonly code: string;
  readonly context?: Record<string, unknown>;
}

class JsonParseError extends JsonError {
  readonly code = 'JSON_PARSE_ERROR';
  constructor(message: string, context?: { position?: number }) {
    super(message);
    this.context = context;
  }
}
```

### 11. Diff Algorithm

**Decision**: Use LCS-based diff for arrays, deep comparison for objects.

**Rationale**:
- Produces minimal patches
- RFC 6902 compatible
- Handles all JSON types

**Implementation**:
```typescript
function diff(before: unknown, after: unknown, path: string = ''): JsonPatchOperation[] {
  if (typeof before !== typeof after) {
    return [{ op: 'replace', path, value: after }];
  }
  
  if (Array.isArray(before) && Array.isArray(after)) {
    return diffArrays(before, after, path);
  }
  
  if (isObject(before) && isObject(after)) {
    return diffObjects(before, after, path);
  }
  
  return before === after ? [] : [{ op: 'replace', path, value: after }];
}
```

### 12. JSON Repair Strategy

**Decision**: Multi-pass repair with pattern matching.

**Rationale**:
- Fix common issues in order
- Preserve valid JSON
- Report what was fixed

**Implementation**:
```typescript
function repair(text: string): string {
  let result = text;
  
  // Pass 1: Remove comments
  result = removeComments(result);
  
  // Pass 2: Fix quotes
  result = fixQuotes(result);
  
  // Pass 3: Fix trailing commas
  result = fixTrailingCommas(result);
  
  // Pass 4: Fix unquoted keys
  result = fixUnquotedKeys(result);
  
  return result;
}
```

## File Organization

```
src/
├── index.ts                 # Main entry, exports
├── kernel.ts                # Micro-kernel implementation
├── types.ts                 # All type definitions
├── errors.ts                # Error classes
├── utils/
│   ├── path-parser.ts       # Path parsing utilities
│   ├── deep-clone.ts        # Deep cloning
│   ├── type-checks.ts       # Type checking utilities
│   └── escape.ts            # String escaping
├── plugins/
│   ├── index.ts             # Plugin exports + presets
│   ├── core/
│   │   ├── parse.plugin.ts
│   │   ├── stringify.plugin.ts
│   │   └── query.plugin.ts
│   └── optional/
│       ├── path.plugin.ts
│       ├── transform.plugin.ts
│       ├── diff.plugin.ts
│       ├── patch.plugin.ts
│       ├── schema.plugin.ts
│       ├── stream.plugin.ts
│       ├── repair.plugin.ts
│       ├── json5.plugin.ts
│       ├── type.plugin.ts
│       └── immutable.plugin.ts
└── cli/
    ├── index.ts             # CLI entry
    ├── commands/            # Individual commands
    └── utils.ts             # CLI utilities
```

## Performance Optimizations

### 1. Lazy Plugin Loading

Plugins are only loaded when `use()` is called. Core plugins are bundled into the main entry for zero overhead.

### 2. Structural Sharing

When setting deep paths, only the modified branch is cloned:

```typescript
// Original: { a: { b: { c: 1 } }, d: 2 }
// Setting a.b.c = 3
// Result: { a: { b: { c: 3 } }, d: 2 }
// Only a, a.b, a.b.c are new objects
// d still references original
```

### 3. Compiled Validators

Schema validation compiles to optimized functions:

```typescript
const validate = json.compile(schema);
// Returns optimized validation function
// No schema interpretation on each call
```

### 4. Buffer Reuse

Streaming operations reuse buffers where possible to minimize allocations.

## Testing Strategy

### Unit Tests

Each module has dedicated tests:
- `kernel.test.ts` - Kernel functionality
- `parse.test.ts` - Parser edge cases
- `stringify.test.ts` - Serialization
- `query.test.ts` - Path operations
- etc.

### Integration Tests

- Plugin system interactions
- Preset loading
- End-to-end workflows

### Test Fixtures

```
tests/fixtures/
├── valid/          # Valid JSON files
├── invalid/        # Invalid JSON for error testing
├── schemas/        # JSON Schema files
├── large/          # Large files for streaming
└── json5/          # JSON5 test files
```

## Bundle Size Targets

| Module | Target (gzip) |
|--------|---------------|
| Kernel | < 2KB |
| parse plugin | < 1KB |
| stringify plugin | < 1KB |
| query plugin | < 1KB |
| path plugin | < 2KB |
| transform plugin | < 1KB |
| diff plugin | < 1KB |
| patch plugin | < 1KB |
| schema plugin | < 3KB |
| stream plugin | < 1KB |
| repair plugin | < 1KB |
| json5 plugin | < 1KB |
| type plugin | < 1KB |
| immutable plugin | < 1KB |

**Total (all plugins)**: < 15KB gzipped

## Compatibility

### Node.js

- Minimum version: 18.x
- Uses built-in `fs` for file operations
- Supports CommonJS and ESM

### Browser

- Targets ES2022
- No Node.js-specific APIs
- Works with bundlers (webpack, vite, etc.)

### Edge Runtimes

- No file system operations
- No native modules
- Pure JavaScript implementation
