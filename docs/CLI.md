# @oxog/json CLI Documentation

Command-line interface for @oxog/json.

## Installation

```bash
npm install -g @oxog/json
```

Or use without installation:

```bash
npx @oxog/json <command> [options]
```

## Commands

### format

Pretty print JSON with proper indentation.

```bash
oxog-json format data.json
oxog-json format data.json -i 4
oxog-json format data.json -s -o formatted.json
cat data.json | oxog-json format
```

**Options:**
- `-i, --indent <n>` - Indentation spaces (default: 2)
- `-s, --sort-keys` - Sort object keys alphabetically
- `-o, --output <file>` - Output file path

### minify

Minify JSON by removing whitespace.

```bash
oxog-json minify data.json
oxog-json minify data.json -o minified.json
```

**Options:**
- `-o, --output <file>` - Output file path

### get

Get a value by JSONPath or dot notation.

```bash
oxog-json get data.json "user.name"
oxog-json get data.json "users[0].email"
oxog-json get data.json "$.store.books[*].title"
```

**Options:**
- `-i, --indent <n>` - Indentation for JSON output (default: 2)
- `-o, --output <file>` - Output file path

### query

Execute JSONPath query expression.

```bash
oxog-json query data.json "$.users[*].name"
oxog-json query data.json "$.store..price"
oxog-json query data.json "$.books[?(@.price < 10)]"
```

**Options:**
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### diff

Compare two JSON files and output JSON Patch.

```bash
oxog-json diff before.json after.json
oxog-json diff before.json after.json -o patch.json
```

**Options:**
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### patch

Apply JSON Patch operations to a file.

```bash
oxog-json patch data.json patch.json
oxog-json patch data.json patch.json -o result.json
```

**Options:**
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### validate

Validate JSON against a JSON Schema.

```bash
oxog-json validate data.json --schema schema.json
oxog-json validate data.json -s schema.json
```

**Options:**
- `-s, --schema <file>` - Schema file path (required)

### repair

Fix broken/invalid JSON automatically.

```bash
oxog-json repair broken.json
oxog-json repair broken.json -o fixed.json
cat broken.json | oxog-json repair
```

**Options:**
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### infer

Generate TypeScript type definitions from JSON.

```bash
oxog-json infer data.json
oxog-json infer data.json --name User
oxog-json infer data.json -n User -o types.ts
```

**Options:**
- `-n, --name <name>` - Type name (default: GeneratedType)
- `-o, --output <file>` - Output file path

### flatten

Flatten nested JSON object to dotted keys.

```bash
oxog-json flatten data.json
oxog-json flatten data.json --separator _
oxog-json flatten data.json -o flat.json
```

**Options:**
- `-s, --separator <char>` - Path separator (default: `.`)
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### unflatten

Unflatten dotted keys to nested JSON.

```bash
oxog-json unflatten flat.json
oxog-json unflatten flat.json --separator _
oxog-json unflatten flat.json -o nested.json
```

**Options:**
- `-s, --separator <char>` - Path separator (default: `.`)
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### merge

Deep merge multiple JSON files.

```bash
oxog-json merge base.json override.json
oxog-json merge a.json b.json c.json -o merged.json
```

**Options:**
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

### lines

Process JSONL (JSON Lines) files.

```bash
oxog-json lines data.jsonl
oxog-json lines data.jsonl -o result.json
oxog-json lines data.jsonl --compact
```

**Options:**
- `-i, --indent <n>` - Indentation for array output (default: 2)
- `-c, --compact` - Output as JSONL instead of array
- `-o, --output <file>` - Output file path

### json5

Parse JSON5 (extended JSON with comments, trailing commas, etc.).

```bash
oxog-json json5 data.json5
oxog-json json5 data.json5 -o output.json
```

**Options:**
- `-i, --indent <n>` - Indentation for output (default: 2)
- `-o, --output <file>` - Output file path

## Global Options

```
-h, --help              Show this help or command-specific help
-v, --version           Show version number
-o, --output <file>     Output to file instead of stdout
-i, --indent <n>        Indentation spaces (default: 2)
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid JSON, validation failed, file not found, etc.)

## Examples

### Format and sort keys

```bash
oxog-json format data.json -s -i 4
```

### Extract nested value

```bash
oxog-json get config.json "database.host"
```

### Query and filter

```bash
oxog-json query users.json "$.users[?(@.age >= 18)].name"
```

### Generate and apply patch

```bash
oxog-json diff old.json new.json -o changes.json
oxog-json patch old.json changes.json -o updated.json
```

### Validate data

```bash
oxog-json validate data.json --schema schema.json || echo "Validation failed"
```

### Generate TypeScript types

```bash
oxog-json infer api-response.json --name ApiResponse > src/types.ts
```

## Aliases

Some commands have aliases:

- `query` ← `jsonpath`
- `json5` ← `json5-parse`, `parse5`
