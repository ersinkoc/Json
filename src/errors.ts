export abstract class JsonError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown> | undefined;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown> | undefined
  ) {
    super(message);
    this.name = 'JsonError';
    this.code = code;
    this.context = context;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class JsonParseError extends JsonError {
  constructor(
    message: string,
    context?: { position?: number; line?: number; column?: number; input?: string }
  ) {
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
    super(
      `Maximum nesting depth of ${maxDepth} exceeded`,
      'MAX_DEPTH_ERROR',
      { maxDepth }
    );
    this.name = 'MaxDepthError';
  }
}

export class PluginError extends JsonError {
  constructor(message: string, pluginName: string, context?: Record<string, unknown>) {
    super(message, 'PLUGIN_ERROR', { ...context, pluginName });
    this.name = 'PluginError';
  }
}

export class CircularReferenceError extends JsonError {
  constructor(context?: { path?: string }) {
    super('Circular reference detected', 'CIRCULAR_REFERENCE_ERROR', context);
    this.name = 'CircularReferenceError';
  }
}
