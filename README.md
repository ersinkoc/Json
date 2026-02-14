# @oxog/json

Zero-dependency JSON Swiss Army Knife for TypeScript.

## Install

```bash
npm install @oxog/json
```

## Quick Start

```typescript
import { json } from '@oxog/json';

// Parse JSON
const data = json.parse('{"name": "Alice", "age": 30}');

// Safe parse (no throw)
const result = json.safeParse('{"valid": true}');
if (result.ok) {
  console.log(result.value);
}

// Deep property access
json.get(data, 'name');           // 'Alice'
json.get(data, 'users[0].email'); // Deep access

// Immutable updates
const updated = json.set(data, 'age', 31);

// Stringify with options
json.stringify(data, { indent: 2 });
```

## Core API

```typescript
// Always available, no plugins needed
json.parse(text, options?)
json.safeParse(text)
json.stringify(value, options?)
json.get(obj, path, fallback?)
json.set(obj, path, value)
json.has(obj, path)
json.remove(obj, path)
json.paths(obj)
```

## Plugins

```typescript
import {
  pathPlugin,       // JSONPath queries
  transformPlugin,  // merge, flatten, pick, omit
  schemaPlugin,     // JSON Schema validation
  diffPlugin,       // JSON diff
  patchPlugin,      // JSON patch
  repairPlugin,     // Fix broken JSON
  json5Plugin,      // JSON5 support
  typePlugin,       // TypeScript inference
  streamPlugin,     // Streaming JSON
  immutablePlugin,  // Immutable operations
  preset            // Pre-configured plugin sets
} from '@oxog/json/plugins';

// Load plugins
json.use(pathPlugin, transformPlugin);

// Or use presets
json.use(...preset.full);        // All plugins
json.use(...preset.minimal);     // transform + repair
json.use(...preset.validation);   // schema + type
json.use(...preset.manipulation); // path + transform + diff + patch
json.use(...preset.formats);      // json5 + repair
json.use(...preset.streaming);    // stream + immutable
```

### JSONPath

```typescript
json.use(pathPlugin);

const data = {
  store: {
    books: [
      { title: 'Book A', price: 10 },
      { title: 'Book B', price: 25 }
    ]
  }
};

json.query(data, '$.store.books[*].title'); // ['Book A', 'Book B']
json.query(data, '$.store.books[?(@.price < 15)]');
```

### Transform

```typescript
json.use(transformPlugin);

json.merge({ a: 1 }, { b: 2 });              // { a: 1, b: 2 }
json.flatten({ a: { b: { c: 1 } } });        // { 'a.b.c': 1 }
json.pick({ a: 1, b: 2, c: 3 }, ['a', 'b']); // { a: 1, b: 2 }
json.omit({ a: 1, b: 2 }, ['b']);            // { a: 1 }
```

### Schema

```typescript
json.use(schemaPlugin);

const schema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' }
  }
};

const result = json.validate({ name: 'Alice', email: 'a@b.com' }, schema);
// { valid: true } or { valid: false, errors: [...] }

const validate = json.compile(schema);
validate(data); // Fast repeated validation
```

### Diff & Patch

```typescript
json.use(diffPlugin, patchPlugin);

const before = { name: 'Alice', age: 30 };
const after = { name: 'Alice', age: 31, email: 'a@b.com' };

const diff = json.diff(before, after);
// [
//   { op: 'replace', path: '/age', value: 31 },
//   { op: 'add', path: '/email', value: 'a@b.com' }
// ]

const patched = json.patch(before, diff);
```

### Repair

```typescript
json.use(repairPlugin);

const broken = '{name: "test", items: [1, 2, 3,],}';
const fixed = json.repair(broken);
// '{"name":"test","items":[1,2,3]}'
```

### JSON5

```typescript
json.use(json5Plugin);

const json5 = `
{
  // Comments allowed
  name: 'Unquoted keys',
  items: [1, 2, 3,],  // Trailing comma
}
`;

const parsed = json.parse5(json5);
```

### TypeScript Inference

```typescript
json.use(typePlugin);

const result = json.infer({ name: 'Alice', age: 30 }, { name: 'Person' });
// {
//   type: 'object',
//   typescript: 'interface Person {\n  name: string;\n  age: number;\n}'
// }
```

## CLI

```bash
# Format JSON
npx @oxog/json format data.json

# Get value by path
npx @oxog/json get data.json "users[0].name"

# Diff two files
npx @oxog/json diff before.json after.json

# Validate against schema
npx @oxog/json validate data.json --schema schema.json

# Repair broken JSON
npx @oxog/json repair broken.json -o fixed.json

# Generate TypeScript types
npx @oxog/json infer data.json --name UserType
```

## Options

### ParseOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `reviver` | `(key, value) => value` | - | Transform parsed values |
| `maxDepth` | `number` | `512` | Maximum nesting depth |
| `maxLength` | `number` | `10MB` | Maximum input length |

### StringifyOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `indent` | `number \| string` | - | Indentation |
| `replacer` | `(key, value) => value` | - | Transform values |
| `circular` | `string \| false` | `false` | Handle circular refs |
| `sortKeys` | `boolean` | `false` | Sort object keys |

## Error Codes

| Code | Description |
|------|-------------|
| `JSON_PARSE_ERROR` | Invalid JSON |
| `JSON_PATH_ERROR` | Invalid path |
| `JSON_SCHEMA_ERROR` | Validation failed |
| `JSON_PATCH_ERROR` | Invalid patch |
| `PLUGIN_ERROR` | Plugin error |
| `MAX_DEPTH_ERROR` | Depth exceeded |
| `MAX_LENGTH_ERROR` | Length exceeded |

## Links

- **npm**: https://npmjs.com/package/@oxog/json
- **GitHub**: https://github.com/ersinkoc/json
- **Website**: https://json.oxog.dev

## License

MIT © Ersin KOÇ
