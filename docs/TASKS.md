# @oxog/json Tasks

## Phase 1: Project Setup

### Task 1.1: Initialize Project Structure
- [ ] Create directory structure (`src/`, `tests/`, `examples/`, etc.)
- [ ] Create `package.json` with all required fields
- [ ] Create `tsconfig.json` with strict mode
- [ ] Create `tsup.config.ts` for building
- [ ] Create `vitest.config.ts` for testing
- [ ] Create `.gitignore`
- [ ] Create `LICENSE` (MIT)

### Task 1.2: Create Core Type Definitions
- [ ] Create `src/types.ts`
- [ ] Define `JsonValue`, `JsonObject`, `JsonArray` types
- [ ] Define `JsonResult<T>` type
- [ ] Define `JsonPlugin` interface
- [ ] Define `JsonConfig` interface
- [ ] Define `ParseOptions`, `StringifyOptions`
- [ ] Define `ValidationResult`, `ValidationError`
- [ ] Define `JsonPatchOperation` type
- [ ] Define `JsonSchema` type

### Task 1.3: Create Error Classes
- [ ] Create `src/errors.ts`
- [ ] Implement `JsonError` base class
- [ ] Implement `JsonParseError`
- [ ] Implement `JsonPathError`
- [ ] Implement `JsonSchemaError`
- [ ] Implement `JsonPatchError`
- [ ] Implement `MaxDepthError`
- [ ] Implement `PluginError`

### Task 1.4: Create Utility Functions
- [ ] Create `src/utils/type-checks.ts` (isObject, isArray, isPlainObject, etc.)
- [ ] Create `src/utils/deep-clone.ts` (deepClone function)
- [ ] Create `src/utils/escape.ts` (escapeString, unescapeString)
- [ ] Create `src/utils/path-parser.ts` (parsePath, stringifyPath)

---

## Phase 2: Micro-Kernel Implementation

### Task 2.1: Implement Kernel Core
- [ ] Create `src/kernel.ts`
- [ ] Implement plugin registry (`Map<string, JsonPlugin>`)
- [ ] Implement method registry (`Map<string, Function>`)
- [ ] Implement `use()` method for plugin registration
- [ ] Implement `register()` for method registration
- [ ] Implement `unregister()` for cleanup
- [ ] Implement plugin lifecycle (install, onInit, onDestroy)
- [ ] Implement dependency resolution
- [ ] Implement error boundary with `onError` callback

### Task 2.2: Implement Event System
- [ ] Create simple event emitter for plugin communication
- [ ] Implement `emit()`, `on()`, `off()` methods
- [ ] Define standard events (plugin:loaded, plugin:error, etc.)

### Task 2.3: Implement Factory Function
- [ ] Create `createJson(config?)` factory function
- [ ] Initialize kernel with default config
- [ ] Create singleton instance `json`
- [ ] Export both from `src/index.ts`

---

## Phase 3: Core Plugins

### Task 3.1: Parse Plugin
- [ ] Create `src/plugins/core/parse.plugin.ts`
- [ ] Implement custom JSON parser (recursive descent)
- [ ] Add depth limiting
- [ ] Add length limiting
- [ ] Implement reviver support
- [ ] Implement `parse()` method
- [ ] Implement `safeParse()` method
- [ ] Add position information in errors
- [ ] Register plugin with kernel

### Task 3.2: Stringify Plugin
- [ ] Create `src/plugins/core/stringify.plugin.ts`
- [ ] Implement custom serializer
- [ ] Implement circular reference detection
- [ ] Implement circular reference replacement option
- [ ] Implement replacer function support
- [ ] Implement pretty printing (indent option)
- [ ] Implement key sorting option
- [ ] Register plugin with kernel

### Task 3.3: Query Plugin
- [ ] Create `src/plugins/core/query.plugin.ts`
- [ ] Implement path parser (dot/bracket notation)
- [ ] Implement `get()` method with fallback
- [ ] Implement `set()` method (immutable)
- [ ] Implement `has()` method
- [ ] Implement `remove()` method (immutable)
- [ ] Implement `paths()` method for enumeration
- [ ] Handle edge cases (null, undefined, arrays)
- [ ] Register plugin with kernel

### Task 3.4: Core Plugin Registration
- [ ] Auto-register core plugins in kernel constructor
- [ ] Create `src/plugins/core/index.ts` exports

---

## Phase 4: Optional Plugins

### Task 4.1: JSONPath Plugin
- [ ] Create `src/plugins/optional/path.plugin.ts`
- [ ] Implement JSONPath tokenizer
- [ ] Implement expression parser
- [ ] Implement evaluator
- [ ] Support `$` (root), `.` (child), `[]` (subscript)
- [ ] Support `*` (wildcard), `..` (recursive descent)
- [ ] Support `[?()]` (filter expressions)
- [ ] Support `[n:m]` (slices)
- [ ] Register as optional plugin

### Task 4.2: Transform Plugin
- [ ] Create `src/plugins/optional/transform.plugin.ts`
- [ ] Implement `merge()` (deep merge)
- [ ] Implement `flatten()` (nested to flat)
- [ ] Implement `unflatten()` (flat to nested)
- [ ] Implement `pick()` (select keys)
- [ ] Implement `omit()` (exclude keys)
- [ ] Implement `sortKeys()` (recursive sort)
- [ ] Implement `mapValues()` (transform values)
- [ ] Implement `filterValues()` (filter values)
- [ ] Register as optional plugin

### Task 4.3: Diff Plugin
- [ ] Create `src/plugins/optional/diff.plugin.ts`
- [ ] Implement deep comparison algorithm
- [ ] Generate RFC 6902 JSON Patch operations
- [ ] Handle `add`, `remove`, `replace` operations
- [ ] Handle `move`, `copy` operations (optimization)
- [ ] Handle array diffing
- [ ] Register as optional plugin

### Task 4.4: Patch Plugin
- [ ] Create `src/plugins/optional/patch.plugin.ts`
- [ ] Implement RFC 6902 patch application
- [ ] Support all operations (add, remove, replace, move, copy, test)
- [ ] Implement `patch()` method
- [ ] Implement `validatePatch()` method
- [ ] Implement `reversePatch()` method
- [ ] Register as optional plugin

### Task 4.5: Schema Plugin
- [ ] Create `src/plugins/optional/schema.plugin.ts`
- [ ] Implement type validation
- [ ] Implement string keywords (minLength, maxLength, pattern, format)
- [ ] Implement number keywords (minimum, maximum, multipleOf)
- [ ] Implement array keywords (items, minItems, maxItems, uniqueItems)
- [ ] Implement object keywords (properties, required, additionalProperties)
- [ ] Implement composition (allOf, anyOf, oneOf, not)
- [ ] Implement `validate()` method
- [ ] Implement `compile()` method for optimization
- [ ] Implement `is()` type guard
- [ ] Implement format validators (email, uri, date, etc.)
- [ ] Register as optional plugin

### Task 4.6: Stream Plugin
- [ ] Create `src/plugins/optional/stream.plugin.ts`
- [ ] Implement streaming array parser
- [ ] Implement streaming object parser
- [ ] Support Node.js Readable streams
- [ ] Support Web ReadableStreams
- [ ] Implement `parse()` streaming method
- [ ] Implement `stringify()` streaming method
- [ ] Implement JSONL support (`parseLines`, `stringifyLines`)
- [ ] Register as optional plugin

### Task 4.7: Repair Plugin
- [ ] Create `src/plugins/optional/repair.plugin.ts`
- [ ] Implement comment removal
- [ ] Implement single quote to double quote conversion
- [ ] Implement unquoted key fixer
- [ ] Implement unquoted value fixer
- [ ] Implement trailing comma removal
- [ ] Implement `repair()` method
- [ ] Register as optional plugin

### Task 4.8: JSON5 Plugin
- [ ] Create `src/plugins/optional/json5.plugin.ts`
- [ ] Implement JSON5 parser (extends repair functionality)
- [ ] Support comments
- [ ] Support trailing commas
- [ ] Support unquoted keys
- [ ] Support single quotes
- [ ] Support hexadecimal numbers
- [ ] Support special numbers (Infinity, -Infinity, NaN)
- [ ] Implement `parse5()` method
- [ ] Implement `stringify5()` method
- [ ] Register as optional plugin

### Task 4.9: Type Plugin
- [ ] Create `src/plugins/optional/type.plugin.ts`
- [ ] Implement type inference from value
- [ ] Generate TypeScript interface string
- [ ] Handle primitive types
- [ ] Handle arrays (uniform vs mixed)
- [ ] Handle nested objects
- [ ] Handle optional properties
- [ ] Implement `infer()` method
- [ ] Register as optional plugin

### Task 4.10: Immutable Plugin
- [ ] Create `src/plugins/optional/immutable.plugin.ts`
- [ ] Implement deep freeze
- [ ] Implement immutable set with structural sharing
- [ ] Implement clone utility
- [ ] Implement `freeze()` method
- [ ] Implement `immutableSet()` method
- [ ] Implement `clone()` method
- [ ] Register as optional plugin

### Task 4.11: Plugin Index and Presets
- [ ] Create `src/plugins/index.ts`
- [ ] Export all optional plugins
- [ ] Create preset objects (full, minimal, validation, processing)
- [ ] Create `createPreset()` utility

---

## Phase 5: CLI Implementation

### Task 5.1: CLI Core
- [x] Create `src/cli/index.ts`
- [x] Parse command line arguments
- [x] Implement help system
- [x] Implement version display
- [x] Handle stdin input
- [x] Handle stdout output
- [x] Add color support

### Task 5.2: CLI Commands
- [x] Implement `format` command
- [x] Implement `minify` command
- [x] Implement `get` command
- [x] Implement `query` command
- [x] Implement `diff` command
- [x] Implement `patch` command
- [x] Implement `validate` command
- [x] Implement `repair` command
- [x] Implement `infer` command
- [x] Implement `flatten` command
- [x] Implement `unflatten` command
- [x] Implement `merge` command
- [x] Implement `lines` command
- [x] Implement `json5` command

---

## Phase 6: Testing

### Task 6.1: Unit Tests - Core
- [ ] Create `tests/unit/kernel.test.ts`
- [ ] Create `tests/unit/parse.test.ts`
- [ ] Create `tests/unit/stringify.test.ts`
- [ ] Create `tests/unit/query.test.ts`

### Task 6.2: Unit Tests - Optional Plugins
- [ ] Create `tests/unit/path.test.ts`
- [ ] Create `tests/unit/transform.test.ts`
- [ ] Create `tests/unit/diff.test.ts`
- [ ] Create `tests/unit/patch.test.ts`
- [ ] Create `tests/unit/schema.test.ts`
- [ ] Create `tests/unit/stream.test.ts`
- [ ] Create `tests/unit/repair.test.ts`
- [ ] Create `tests/unit/json5.test.ts`
- [ ] Create `tests/unit/type.test.ts`
- [ ] Create `tests/unit/immutable.test.ts`

### Task 6.3: Unit Tests - Utilities
- [ ] Create `tests/unit/utils/path-parser.test.ts`
- [ ] Create `tests/unit/utils/deep-clone.test.ts`
- [ ] Create `tests/unit/utils/type-checks.test.ts`

### Task 6.4: Unit Tests - CLI
- [ ] Create `tests/unit/cli.test.ts`

### Task 6.5: Integration Tests
- [ ] Create `tests/integration/plugin-system.test.ts`
- [ ] Create `tests/integration/presets.test.ts`
- [ ] Create `tests/integration/factory.test.ts`
- [ ] Create `tests/integration/end-to-end.test.ts`

### Task 6.6: Test Fixtures
- [ ] Create `tests/fixtures/valid/` with valid JSON files
- [ ] Create `tests/fixtures/invalid/` with broken JSON
- [ ] Create `tests/fixtures/schemas/` with JSON Schema files
- [ ] Create `tests/fixtures/large/` with large JSON files
- [ ] Create `tests/fixtures/json5/` with JSON5 files

### Task 6.7: Achieve 100% Coverage
- [ ] Run coverage report
- [ ] Fix uncovered lines
- [ ] Fix uncovered branches
- [ ] Verify 100% on all metrics

---

## Phase 7: Documentation

### Task 7.1: JSDoc Comments
- [ ] Add JSDoc to all public APIs in kernel
- [ ] Add JSDoc to all core plugin methods
- [ ] Add JSDoc to all optional plugin methods
- [ ] Add @example to every public method
- [ ] Add @param, @returns, @throws annotations

### Task 7.2: llms.txt
- [ ] Create `llms.txt` in project root
- [ ] Keep under 2000 tokens
- [ ] Include basic usage
- [ ] Include API summary
- [ ] Include error codes
- [ ] Include links

### Task 7.3: README.md
- [ ] Create compelling introduction
- [ ] Add installation instructions
- [ ] Add quick start examples
- [ ] Add feature overview
- [ ] Add API documentation link
- [ ] Optimize first 500 tokens for LLM

### Task 7.4: Examples
- [ ] Create `examples/01-basic/` directory
- [ ] Create `examples/02-query/` directory
- [ ] Create `examples/03-transform/` directory
- [ ] Create `examples/04-diff-patch/` directory
- [ ] Create `examples/05-validation/` directory
- [ ] Create `examples/06-streaming/` directory
- [ ] Create `examples/07-repair/` directory
- [ ] Create `examples/08-advanced/` directory
- [ ] Create `examples/09-integrations/` directory
- [ ] Create `examples/10-real-world/` directory
- [ ] Create 18+ example files

---

## Phase 8: MCP Server

### Task 8.1: MCP Server Setup
- [ ] Create `mcp-server/` directory
- [ ] Create `mcp-server/package.json`
- [ ] Create `mcp-server/tsconfig.json`
- [ ] Create `mcp-server/src/index.ts`

### Task 8.2: MCP Tools
- [ ] Implement `json_search_docs` tool
- [ ] Implement `json_get_example` tool
- [ ] Implement `json_api_reference` tool
- [ ] Implement `json_validate_snippet` tool

### Task 8.3: MCP Data
- [ ] Create `mcp-server/src/data/docs.json`
- [ ] Create `mcp-server/src/data/examples/` directory

---

## Phase 9: Website

### Task 9.1: Website Setup
- [ ] Create `website/` directory
- [ ] Initialize Vite + React project
- [ ] Configure Tailwind CSS 4.x
- [ ] Set up shadcn/ui components
- [ ] Configure @oxog/codeshine
- [ ] Set up React Router

### Task 9.2: Website Components
- [ ] Create Layout component
- [ ] Create Header component
- [ ] Create Sidebar component
- [ ] Create Footer component
- [ ] Create CodeBlock component
- [ ] Create ThemeToggle component
- [ ] Create CopyButton component

### Task 9.3: Website Pages
- [ ] Create Home page (Hero, Features, Stats)
- [ ] Create Docs page with navigation
- [ ] Create API Reference page
- [ ] Create Examples page
- [ ] Create Plugins page
- [ ] Create Playground page

### Task 9.4: Website Deployment
- [ ] Create `website/public/CNAME` with json.oxog.dev
- [ ] Copy `llms.txt` to `website/public/`
- [ ] Create GitHub Actions workflow
- [ ] Test build process

---

## Phase 10: Final Verification

### Task 10.1: Build Verification
- [ ] Run `npm run build` - must succeed
- [ ] Verify ESM output
- [ ] Verify CJS output
- [ ] Verify type definitions

### Task 10.2: Test Verification
- [ ] Run `npm run test:coverage` - must show 100%
- [ ] All tests passing
- [ ] No skipped tests

### Task 10.3: Type Verification
- [ ] Run `npm run typecheck` - no errors
- [ ] Verify strict mode compliance

### Task 10.4: Lint Verification
- [ ] Run `npm run lint` - no errors

### Task 10.5: CLI Verification
- [ ] Test all CLI commands work
- [ ] Test stdin/stdout works
- [ ] Test error handling

### Task 10.6: Examples Verification
- [ ] Run all examples
- [ ] Verify expected output

### Task 10.7: Website Verification
- [ ] Build website without errors
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] Dark/light theme works

---

## Task Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Kernel)
    ↓
Phase 3 (Core Plugins) ← depends on Phase 1, 2
    ↓
Phase 4 (Optional Plugins) ← depends on Phase 2
    ↓
Phase 5 (CLI) ← depends on Phase 3, 4
    ↓
Phase 6 (Testing) ← depends on all code phases
    ↓
Phase 7 (Documentation) ← parallel with Phase 6
    ↓
Phase 8 (MCP Server) ← depends on Phase 7
    ↓
Phase 9 (Website) ← depends on Phase 7
    ↓
Phase 10 (Verification) ← depends on all
```

## Execution Order

1. Complete Phase 1 entirely before Phase 2
2. Complete Phase 2 entirely before Phase 3
3. Phase 3 must complete before Phase 4
4. Phase 4 plugins can be implemented in parallel
5. Phase 5 can start after Phase 3 is complete
6. Phase 6 runs after all code is written
7. Phase 7 can run parallel with Phase 6
8. Phase 8 and 9 can run in parallel after Phase 7
9. Phase 10 runs last
