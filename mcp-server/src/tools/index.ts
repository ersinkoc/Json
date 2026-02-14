/**
 * MCP Tools for @oxog/json
 * Provides Model Context Protocol tools for JSON operations
 */

import { createJson } from '../../src/index';
import { parsePlugin } from '../../src/plugins/core/parse.plugin';
import { stringifyPlugin } from '../../src/plugins/core/stringify.plugin';
import { queryPlugin } from '../../src/plugins/core/query.plugin';
import { transformPlugin } from '../../src/plugins/optional/transform.plugin';
import { diffPlugin } from '../../src/plugins/optional/diff.plugin';
import { patchPlugin } from '../../src/plugins/optional/patch.plugin';
import { schemaPlugin } from '../../src/plugins/optional/schema.plugin';
import { typePlugin } from '../../src/plugins/optional/type.plugin';
import { json5Plugin } from '../../src/plugins/optional/json5.plugin';
import { repairPlugin } from '../../src/plugins/optional/repair.plugin';

// Create JSON instance with all plugins
const json = createJson({});
json.use(
  parsePlugin,
  stringifyPlugin,
  queryPlugin,
  transformPlugin,
  diffPlugin,
  patchPlugin,
  schemaPlugin,
  typePlugin,
  json5Plugin,
  repairPlugin
);

export interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

/**
 * Parse JSON string with error handling
 */
export async function parseJson(args: { json: string }): Promise<ToolResponse> {
  try {
    const result = json.safeParse(args.json);
    if (result.ok) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.value, null, 2),
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Parse Error: ${result.error?.message || 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Stringify value to JSON
 */
export async function stringifyJson(args: { value: unknown; indent?: number }): Promise<ToolResponse> {
  try {
    const result = json.stringify(args.value, { indent: args.indent ?? 2 });
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Query JSON value using path expression
 */
export async function queryJson(args: { json: string; path: string }): Promise<ToolResponse> {
  try {
    const obj = json.parse(args.json);
    const result = json.get(obj, args.path);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Transform JSON with various operations
 */
export async function transformJson(args: {
  json: string;
  operation: 'merge' | 'flatten' | 'pick' | 'omit' | 'sortKeys';
  params?: Record<string, unknown>;
}): Promise<ToolResponse> {
  try {
    const obj = json.parse(args.json);
    let result: unknown;

    switch (args.operation) {
      case 'merge':
        const sources = Array.isArray(args.params?.sources)
          ? (args.params.sources as unknown[]).map((s) => json.parse(JSON.stringify(s)))
          : [];
        result = json.merge(obj, ...sources);
        break;
      case 'flatten':
        result = json.flatten(obj);
        break;
      case 'pick':
        result = json.pick(obj, (args.params?.keys as string[]) || []);
        break;
      case 'omit':
        result = json.omit(obj, (args.params?.keys as string[]) || []);
        break;
      case 'sortKeys':
        result = json.sortKeys(obj);
        break;
      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown operation: ${args.operation}`,
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Generate diff between two JSON values
 */
export async function diffJson(args: { before: string; after: string }): Promise<ToolResponse> {
  try {
    const before = json.parse(args.before);
    const after = json.parse(args.after);
    const patches = json.diff(before, after);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(patches, null, 2),
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Apply JSON patches to a value
 */
export async function patchJson(args: { json: string; patches: string }): Promise<ToolResponse> {
  try {
    const obj = json.parse(args.json);
    const patches = json.parse(args.patches);
    const result = json.patch(obj, patches);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Validate JSON against a schema
 */
export async function validateJson(args: { json: string; schema: string }): Promise<ToolResponse> {
  try {
    const data = json.parse(args.json);
    const schema = json.parse(args.schema);
    const result = json.validate(data, schema);

    if (result.valid) {
      return {
        content: [
          {
            type: 'text',
            text: 'Valid: The JSON conforms to the provided schema.',
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Invalid:\n${result.errors.map((e) => `  - ${e.path || '/'}: ${e.message}`).join('\n')}`,
          },
        ],
        isError: true,
      };
    }
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Infer TypeScript type from JSON
 */
export async function inferType(args: { json: string; name?: string }): Promise<ToolResponse> {
  try {
    const data = json.parse(args.json);
    const result = json.infer(data, { name: args.name || 'InferredType', export: false });

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Repair malformed JSON
 */
export async function repairJson(args: { json: string }): Promise<ToolResponse> {
  try {
    const repaired = json.repair(args.json);

    // Verify the repaired JSON is valid
    const result = json.safeParse(repaired);
    if (result.ok) {
      return {
        content: [
          {
            type: 'text',
            text: `Repaired JSON:\n${repaired}\n\nParsed value:\n${JSON.stringify(result.value, null, 2)}`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Partially repaired (still invalid):\n${repaired}\n\nError: ${result.error?.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (e) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(e as Error).message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Get all available tools and their descriptions
 */
export function getToolDefinitions(): Array<{
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}> {
  return [
    {
      name: 'json_parse',
      description: 'Parse a JSON string and return the parsed value with proper error handling',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'JSON string to parse' },
        },
        required: ['json'],
      },
    },
    {
      name: 'json_stringify',
      description: 'Convert a JavaScript value to a JSON string with formatting options',
      inputSchema: {
        type: 'object',
        properties: {
          value: { description: 'Value to stringify' },
          indent: { type: 'number', description: 'Number of spaces for indentation (default: 2)' },
        },
        required: ['value'],
      },
    },
    {
      name: 'json_query',
      description: 'Query a JSON object using dot-notation path (e.g., "user.profile.name")',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'JSON string to query' },
          path: { type: 'string', description: 'Dot-notation path to query' },
        },
        required: ['json', 'path'],
      },
    },
    {
      name: 'json_transform',
      description: 'Transform JSON using operations like merge, flatten, pick, omit, or sortKeys',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'JSON string to transform' },
          operation: {
            type: 'string',
            enum: ['merge', 'flatten', 'pick', 'omit', 'sortKeys'],
            description: 'Transformation operation',
          },
          params: {
            type: 'object',
            description: 'Additional parameters for the operation (e.g., keys for pick/omit, sources for merge)',
          },
        },
        required: ['json', 'operation'],
      },
    },
    {
      name: 'json_diff',
      description: 'Generate JSON Patch operations to transform one JSON value into another',
      inputSchema: {
        type: 'object',
        properties: {
          before: { type: 'string', description: 'Original JSON string' },
          after: { type: 'string', description: 'Target JSON string' },
        },
        required: ['before', 'after'],
      },
    },
    {
      name: 'json_patch',
      description: 'Apply JSON Patch operations to a JSON value',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'JSON string to patch' },
          patches: { type: 'string', description: 'JSON Patch array as string' },
        },
        required: ['json', 'patches'],
      },
    },
    {
      name: 'json_validate',
      description: 'Validate a JSON value against a JSON Schema',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'JSON string to validate' },
          schema: { type: 'string', description: 'JSON Schema as string' },
        },
        required: ['json', 'schema'],
      },
    },
    {
      name: 'json_infer_type',
      description: 'Infer TypeScript type definition from a JSON value',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'JSON string to infer type from' },
          name: { type: 'string', description: 'Name for the inferred type (default: InferredType)' },
        },
        required: ['json'],
      },
    },
    {
      name: 'json_repair',
      description: 'Attempt to repair malformed JSON by fixing common issues',
      inputSchema: {
        type: 'object',
        properties: {
          json: { type: 'string', description: 'Malformed JSON string to repair' },
        },
        required: ['json'],
      },
    },
  ];
}

/**
 * Execute a tool by name
 */
export async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResponse> {
  switch (name) {
    case 'json_parse':
      return parseJson(args as { json: string });
    case 'json_stringify':
      return stringifyJson(args as { value: unknown; indent?: number });
    case 'json_query':
      return queryJson(args as { json: string; path: string });
    case 'json_transform':
      return transformJson(args as { json: string; operation: string; params?: Record<string, unknown> });
    case 'json_diff':
      return diffJson(args as { before: string; after: string });
    case 'json_patch':
      return patchJson(args as { json: string; patches: string });
    case 'json_validate':
      return validateJson(args as { json: string; schema: string });
    case 'json_infer_type':
      return inferType(args as { json: string; name?: string });
    case 'json_repair':
      return repairJson(args as { json: string });
    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`,
          },
        ],
        isError: true,
      };
  }
}
