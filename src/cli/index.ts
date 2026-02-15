/**
 * @oxog/json CLI - Built with @oxog/cli framework
 *
 * Zero-dependency JSON Swiss Army Knife command-line interface
 */

import { createJson } from "../kernel";
import type {
  JsonValue,
  ParseOptions,
  StringifyOptions,
  ValidationResult,
  JsonPatchOperation,
  JsonSchema,
} from "../types";
import {
  parsePlugin,
  stringifyPlugin,
  queryPlugin,
  pathPlugin,
  transformPlugin,
  diffPlugin,
  patchPlugin,
  schemaPlugin,
  repairPlugin,
  typePlugin,
  json5Plugin,
} from "../plugins";

// CLI kernel type with all methods
interface CliKernel {
  use: (...plugins: unknown[]) => void;
  parse: (text: string, options?: ParseOptions) => JsonValue;
  stringify: (value: unknown, options?: StringifyOptions) => string;
  safeParse: (
    text: string,
    options?: ParseOptions,
  ) => { ok: boolean; value?: JsonValue; error?: Error };
  get: (obj: unknown, path: string, fallback?: unknown) => unknown;
  set: (obj: unknown, path: string, value: unknown) => unknown;
  has: (obj: unknown, path: string) => boolean;
  remove: (obj: unknown, path: string) => unknown;
  paths: (obj: unknown) => string[];
  query: (data: unknown, expression: string) => unknown[];
  merge: (...args: unknown[]) => unknown;
  flatten: (
    obj: unknown,
    options?: { separator?: string },
  ) => Record<string, unknown>;
  unflatten: (obj: Record<string, unknown>, separator?: string) => unknown;
  pick: (obj: unknown, keys: string | string[]) => unknown;
  omit: (obj: unknown, keys: string | string[]) => unknown;
  sortKeys: (obj: unknown) => unknown;
  diff: (before: unknown, after: unknown) => JsonPatchOperation[];
  patch: (obj: unknown, operations: JsonPatchOperation[]) => unknown;
  validate: (data: unknown, schema: JsonSchema) => ValidationResult;
  repair: (text: string) => string;
  infer: (
    data: unknown,
    options?: { name?: string; export?: boolean },
  ) => string;
  parse5: (text: string) => unknown;
  stringify5: (
    value: unknown,
    options?: { indent?: number | string; quote?: '"' | "'" },
  ) => string;
  freeze: <T>(obj: T) => T;
  clone: <T>(obj: T) => T;
}

// Create kernel with all plugins
const json = createJson({}) as unknown as CliKernel;
json.use(
  parsePlugin,
  stringifyPlugin,
  queryPlugin,
  pathPlugin,
  transformPlugin,
  diffPlugin,
  patchPlugin,
  schemaPlugin,
  repairPlugin,
  typePlugin,
  json5Plugin,
);

// CLI Configuration
const VERSION = "1.0.1";
const COMMAND_NAME = "oxog-json";

// Color utilities
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  magenta: "\x1b[35m",
} as const;

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

// ============================================================================
// CLI Framework - Simple Command Registry
// ============================================================================

interface CliContext {
  args: string[];
  options: Record<string, unknown>;
  input?: string | undefined;
  output?: string | undefined;
}

type CommandHandler = (context: CliContext) => void | Promise<void>;

interface Command {
  name: string;
  description: string;
  aliases?: string[];
  options?: CliOption[];
  examples: string[];
  handler: CommandHandler;
}

interface CliOption {
  name: string;
  short?: string;
  description: string;
  type?: "string" | "number" | "boolean";
  default?: unknown;
  required?: boolean;
}

interface CommandRegistry {
  [name: string]: Command;
}

// ============================================================================
// Command Registry
// ============================================================================

const commands: CommandRegistry = {};

function registerCommand(command: Command): void {
  commands[command.name] = command;
  for (const alias of command.aliases ?? []) {
    commands[alias] = { ...command, name: alias };
  }
}

// ============================================================================
// Input/Output Utilities
// ============================================================================

async function readInput(file?: string): Promise<string> {
  if (file) {
    const fs = await import("fs");
    return fs.readFileSync(file, "utf-8");
  }

  if (!process.stdin.isTTY) {
    return new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  }

  throw new Error("No input file provided and stdin is not available");
}

function writeOutput(content: string, file?: string): void {
  if (file) {
    const fs = require("fs");
    fs.writeFileSync(file, content);
  } else {
    console.log(content);
  }
}

function writeError(message: string, code = 1): never {
  console.error(colorize(`Error: ${message}`, "red"));
  process.exit(code);
}

// ============================================================================
// Commands
// ============================================================================

registerCommand({
  name: "format",
  description: "Pretty print JSON with proper indentation",
  options: [
    {
      name: "indent",
      short: "i",
      description: "Indentation spaces",
      type: "number",
      default: 2,
    },
    {
      name: "sort-keys",
      short: "s",
      description: "Sort object keys alphabetically",
      type: "boolean",
    },
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
  ],
  examples: [
    "oxog-json format data.json",
    "oxog-json format data.json -i 4",
    "oxog-json format data.json -s -o formatted.json",
    "cat data.json | oxog-json format",
  ],
  handler: async (ctx) => {
    const indent = (ctx.options.indent as number) ?? 2;
    const sortKeys = ctx.options["sort-keys"] as boolean;
    const output = ctx.options.output as string | undefined;

    const data = await readInput(ctx.input);
    let parsed: unknown = json.parse(data);

    if (sortKeys) {
      parsed = json.sortKeys(parsed);
    }

    const result = json.stringify(parsed, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "minify",
  description: "Minify JSON by removing whitespace",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
  ],
  examples: [
    "oxog-json minify data.json",
    "oxog-json minify data.json -o minified.json",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const data = await readInput(ctx.input);
    const parsed = json.parse(data);
    const result = json.stringify(parsed);
    writeOutput(result, output);
  },
});

registerCommand({
  name: "get",
  description: "Get a value by JSONPath or dot notation",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for JSON output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    'oxog-json get data.json "user.name"',
    'oxog-json get data.json "users[0].email"',
    'oxog-json get data.json "$.store.books[*].title"',
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;
    const file = ctx.args[0];
    const path = ctx.args[1] ?? "";

    const data = await readInput(file);
    const parsed = json.parse(data);
    const value = json.get(parsed, path);

    const result =
      typeof value === "object" && value !== null
        ? json.stringify(value, { indent })
        : String(value);
    writeOutput(result, output);
  },
});

registerCommand({
  name: "query",
  description: "Execute JSONPath query",
  aliases: ["jsonpath"],
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    'oxog-json query data.json "$.users[*].name"',
    'oxog-json query data.json "$.store..price"',
    'oxog-json query data.json "$.books[?(@.price < 10)]"',
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;
    const file = ctx.args[0];
    const expression = ctx.args[1] ?? "";

    const data = await readInput(file);
    const parsed = json.parse(data);
    const results = json.query(parsed, expression);

    const result = json.stringify(results, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "diff",
  description: "Compare two JSON files and output JSON Patch",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json diff before.json after.json",
    "oxog-json diff before.json after.json -o patch.json",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;
    const file1 = ctx.args[0];
    const file2 = ctx.args[1];

    if (!file1 || !file2) {
      writeError("Two files required for diff", 1);
    }

    const fs = await import("fs");
    const data1 = json.parse(fs.readFileSync(file1, "utf-8"));
    const data2 = json.parse(fs.readFileSync(file2, "utf-8"));

    const patch = json.diff(data1, data2);
    const result = json.stringify(patch, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "patch",
  description: "Apply JSON Patch operations",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json patch data.json patch.json",
    "oxog-json patch data.json patch.json -o result.json",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;
    const file = ctx.args[0];
    const patchFile = ctx.args[1];

    if (!file || !patchFile) {
      writeError("Two files required: data file and patch file", 1);
    }

    const fs = await import("fs");
    const data = json.parse(fs.readFileSync(file, "utf-8"));
    const patchOps = json.parse(
      fs.readFileSync(patchFile, "utf-8"),
    ) as JsonPatchOperation[];

    const result = json.patch(data, patchOps);
    const outputStr = json.stringify(result, { indent });
    writeOutput(outputStr, output);
  },
});

registerCommand({
  name: "validate",
  description: "Validate JSON against a JSON Schema",
  options: [
    {
      name: "schema",
      short: "s",
      description: "Schema file path",
      type: "string",
      required: true,
    },
  ],
  examples: [
    "oxog-json validate data.json --schema schema.json",
    "oxog-json validate data.json -s schema.json",
  ],
  handler: async (ctx) => {
    const schemaFile = ctx.options.schema as string;
    if (!schemaFile) {
      writeError("Schema file required (--schema)", 1);
    }

    const fs = await import("fs");
    const data = await readInput(ctx.input);
    const parsed = json.parse(data);
    const schema = json.parse(
      fs.readFileSync(schemaFile, "utf-8"),
    ) as JsonSchema;

    const result = json.validate(parsed, schema);

    if (result.valid) {
      console.log(colorize("Valid", "green"));
    } else {
      console.log(colorize("Invalid", "red"));
      for (const error of result.errors) {
        const path = error.path ? colorize(error.path, "yellow") : "root";
        console.log(`  ${path}: ${error.message}`);
      }
      process.exit(1);
    }
  },
});

registerCommand({
  name: "repair",
  description: "Fix broken/invalid JSON",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json repair broken.json",
    "oxog-json repair broken.json -o fixed.json",
    "cat broken.json | oxog-json repair",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;

    const data = await readInput(ctx.input);
    const repaired = json.repair(data);
    const parsed = json.parse(repaired);
    const result = json.stringify(parsed, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "infer",
  description: "Generate TypeScript type definitions from JSON",
  options: [
    {
      name: "name",
      short: "n",
      description: "Type name",
      type: "string",
      default: "GeneratedType",
    },
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
  ],
  examples: [
    "oxog-json infer data.json",
    "oxog-json infer data.json --name User",
    "oxog-json infer data.json -n User -o types.ts",
  ],
  handler: async (ctx) => {
    const name = (ctx.options.name as string) ?? "GeneratedType";
    const output = ctx.options.output as string | undefined;

    const data = await readInput(ctx.input);
    const parsed = json.parse(data);
    const typeStr = json.infer(parsed, { name, export: true });
    writeOutput(typeStr, output);
  },
});

registerCommand({
  name: "flatten",
  description: "Flatten nested JSON object",
  options: [
    {
      name: "separator",
      short: "s",
      description: "Path separator",
      type: "string",
      default: ".",
    },
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json flatten data.json",
    "oxog-json flatten data.json --separator _",
    "oxog-json flatten data.json -o flat.json",
  ],
  handler: async (ctx) => {
    const separator = (ctx.options.separator as string) ?? ".";
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;

    const data = await readInput(ctx.input);
    const parsed = json.parse(data);
    const flat = json.flatten(parsed, { separator });
    const result = json.stringify(flat, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "unflatten",
  description: "Unflatten dotted keys to nested JSON",
  options: [
    {
      name: "separator",
      short: "s",
      description: "Path separator",
      type: "string",
      default: ".",
    },
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json unflatten flat.json",
    "oxog-json unflatten flat.json --separator _",
    "oxog-json unflatten flat.json -o nested.json",
  ],
  handler: async (ctx) => {
    const separator = (ctx.options.separator as string) ?? ".";
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;

    const data = await readInput(ctx.input);
    const parsed = json.parse(data) as Record<string, unknown>;
    const nested = json.unflatten(parsed, separator);
    const result = json.stringify(nested, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "merge",
  description: "Deep merge multiple JSON files",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json merge base.json override.json",
    "oxog-json merge a.json b.json c.json -o merged.json",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;

    const fs = await import("fs");
    const objects = ctx.args.map((file) =>
      json.parse(fs.readFileSync(file, "utf-8")),
    );

    if (objects.length < 2) {
      writeError("At least two files required for merge", 1);
    }

    const merged = json.merge({}, ...objects);
    const result = json.stringify(merged, { indent });
    writeOutput(result, output);
  },
});

registerCommand({
  name: "lines",
  description: "Process JSONL (JSON Lines) files",
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for array output",
      type: "number",
      default: 2,
    },
    {
      name: "compact",
      short: "c",
      description: "Output as JSONL instead of array",
      type: "boolean",
    },
  ],
  examples: [
    "oxog-json lines data.jsonl",
    "oxog-json lines data.jsonl -o result.json",
    "oxog-json lines data.jsonl --compact",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;
    const compact = ctx.options.compact as boolean;

    const data = await readInput(ctx.input);
    const lines = data.split("\n").filter((l) => l.trim());
    const parsed = lines.map((l) => json.parse(l));

    if (compact) {
      const result = parsed.map((p: unknown) => json.stringify(p)).join("\n");
      writeOutput(result, output);
    } else {
      const result = json.stringify(parsed, { indent });
      writeOutput(result, output);
    }
  },
});

registerCommand({
  name: "json5",
  description:
    "Parse JSON5 (extended JSON with comments, trailing commas, etc.)",
  aliases: ["json5-parse", "parse5"],
  options: [
    {
      name: "output",
      short: "o",
      description: "Output file path",
      type: "string",
    },
    {
      name: "indent",
      short: "i",
      description: "Indentation for output",
      type: "number",
      default: 2,
    },
  ],
  examples: [
    "oxog-json json5 data.json5",
    "oxog-json json5 data.json5 -o output.json",
  ],
  handler: async (ctx) => {
    const output = ctx.options.output as string | undefined;
    const indent = (ctx.options.indent as number) ?? 2;

    const data = await readInput(ctx.input);
    const parsed = json.parse5(data);
    const result = json.stringify(parsed, { indent });
    writeOutput(result, output);
  },
});

// ============================================================================
// Help and Version
// ============================================================================

function printHelp(command?: string): void {
  if (command && commands[command]) {
    const cmd = commands[command];
    if (!cmd) return;
    const mainCmd = cmd.aliases?.includes(command)
      ? commands[cmd.aliases?.[0] ?? ""]
      : cmd;
    if (!mainCmd) return;

    console.log(`
${colorize(COMMAND_NAME, "cyan")} - ${colorize(mainCmd.name, "yellow")} ${colorize("-", "gray")} ${mainCmd.description}

${colorize("Usage:", "yellow")}
  ${COMMAND_NAME} ${mainCmd.name} [options] ${mainCmd.name === "diff" || mainCmd.name === "patch" || mainCmd.name === "merge" ? "<file>..." : "<file>"}
${
  mainCmd.name === "get" || mainCmd.name === "query"
    ? `
  ${COMMAND_NAME} ${mainCmd.name} <file> "<expression>"
`
    : ""
}

${colorize("Options:", "yellow")}`);
    for (const opt of mainCmd.options ?? []) {
      const short = opt.short ? `-${opt.short}, ` : "    ";
      const def =
        opt.default !== undefined
          ? ` [default: ${JSON.stringify(opt.default)}]`
          : "";
      console.log(
        `  ${short}--${opt.name.padEnd(15)} ${opt.description}${def}`,
      );
    }

    console.log(`
${colorize("Examples:", "yellow")}`);
    for (const ex of mainCmd.examples) {
      console.log(`  ${colorize(ex, "gray")}`);
    }

    console.log(`
${colorize('See "oxog-json help" for all commands', "cyan")}
`);
    return;
  }

  console.log(`
${colorize("@oxog/json", "cyan")} - Zero-dependency JSON Swiss Army Knife v${VERSION}

${colorize("Usage:", "yellow")}
  ${COMMAND_NAME} <command> [options] [arguments...]

${colorize("Commands:", "yellow")}`);

  const cmdNames = Object.keys(commands).filter(
    (k) => !commands[k]?.aliases?.includes(k),
  );
  for (const name of cmdNames) {
    const cmd = commands[name];
    if (!cmd) continue;
    const aliases = cmd.aliases?.length ? ` (${cmd.aliases.join(", ")})` : "";
    console.log(
      `  ${colorize(name.padEnd(15), "green")}${cmd.description}${aliases}`,
    );
  }

  console.log(`
${colorize("Global Options:", "yellow")}
  -h, --help              Show this help or command-specific help
  -v, --version           Show version number

${colorize("Examples:", "yellow")}
  ${colorize("oxog-json format data.json", "gray")}
  ${colorize('oxog-json get data.json "user.name"', "gray")}
  ${colorize('oxog-json query data.json "$.users[*].name"', "gray")}
  ${colorize("oxog-json diff before.json after.json", "gray")}
  ${colorize("oxog-json validate data.json --schema schema.json", "gray")}
  ${colorize("cat data.json | oxog-json format", "gray")}

${colorize("Documentation:", "cyan")}
  https://json.oxog.dev

${colorize('Use "oxog-json help <command>" for command-specific help', "gray")}
`);
}

function printVersion(): void {
  console.log(`@oxog/json v${VERSION}`);
}

// ============================================================================
// Argument Parser
// ============================================================================

interface ParsedArgs {
  command: string;
  args: string[];
  options: Record<string, unknown>;
  help: boolean;
  version: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: "",
    args: [],
    options: {},
    help: false,
    version: false,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (!arg) {
      i++;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      result.help = true;
      i++;
    } else if (arg === "-v" || arg === "--version") {
      result.version = true;
      i++;
    } else if (arg.startsWith("-")) {
      // Parse option
      const optName = arg.replace(/^-+/, "");
      let optKey = optName;
      let optValue: unknown = true;

      // Check if it's a flag with value
      const equalsIdx = optName.indexOf("=");
      if (equalsIdx > 0) {
        optKey = optName.slice(0, equalsIdx);
        optValue = optName.slice(equalsIdx + 1);
      } else if (
        i + 1 < argv.length &&
        argv[i + 1] &&
        !argv[i + 1]!.startsWith("-")
      ) {
        // Next arg is the value
        i++;
        optValue = argv[i]!;
      }

      result.options[optKey] = optValue;
      i++;
    } else if (!result.command) {
      result.command = arg;
      i++;
    } else {
      result.args.push(arg);
      i++;
    }
  }

  return result;
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.version) {
    printVersion();
    process.exit(0);
  }

  if (parsed.help || !parsed.command) {
    printHelp(parsed.command);
    process.exit(0);
  }

  const command = commands[parsed.command];
  if (!command) {
    console.error(colorize(`Unknown command: ${parsed.command}`, "red"));
    console.error(
      colorize(`Run "${COMMAND_NAME} help" for available commands`, "gray"),
    );
    process.exit(1);
  }

  // Build context
  const context: CliContext = {
    args: parsed.args,
    options: parsed.options,
    input: parsed.args[0] ?? undefined,
    output: (parsed.options.output as string | undefined) ?? undefined,
  };

  try {
    await command.handler(context);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(message, 1);
  }
}

main();
