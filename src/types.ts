import type { JsonError as JsonErrorType } from './errors';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonPrimitive = string | number | boolean | null;
export type JsonPath = string;

export interface JsonResult<T = JsonValue> {
  ok: boolean;
  value?: T;
  error?: JsonErrorType;
}

export interface ParseOptions {
  reviver?: (key: string, value: unknown) => unknown;
  maxDepth?: number;
  maxLength?: number;
  strict?: boolean;
}

export interface StringifyOptions {
  indent?: number | string;
  replacer?: (key: string, value: unknown) => unknown;
  circular?: string | false;
  sortKeys?: boolean;
}

export type JsonPatchOperation =
  | { op: 'add'; path: string; value: JsonValue }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: JsonValue }
  | { op: 'move'; from: string; path: string }
  | { op: 'copy'; from: string; path: string }
  | { op: 'test'; path: string; value: JsonValue };

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params?: Record<string, unknown>;
}

export interface JsonSchema {
  $schema?: string;
  $id?: string;
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  
  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];
  
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number | boolean;
  minimum?: number;
  exclusiveMinimum?: number | boolean;
  
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;
  
  items?: JsonSchema | JsonSchema[];
  additionalItems?: JsonSchema | boolean;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JsonSchema;
  
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  patternProperties?: Record<string, JsonSchema>;
  additionalProperties?: JsonSchema | boolean;
  dependencies?: Record<string, JsonSchema | string[]>;
  propertyNames?: JsonSchema;
  
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
  
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  
  definitions?: Record<string, JsonSchema>;
  $defs?: Record<string, JsonSchema>;
  
  $ref?: string;
  
  contentEncoding?: string;
  contentMediaType?: string;
  
  [key: string]: unknown;
}

export interface JsonPlugin<TContext = unknown> {
  name: string;
  version: string;
  dependencies?: string[];
  install: (kernel: JsonKernel<TContext>) => void;
  onInit?: (context: TContext) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  onError?: (error: Error) => void;
}

export interface JsonKernel<TContext = unknown> {
  use(...plugins: JsonPlugin<TContext>[]): void;
  register(name: string, method: Function, pluginName?: string): void;
  unregister(name: string): void;
  has(name: string): boolean;
  get<T extends Function>(name: string): T | undefined;
  emit(event: string, data?: unknown): void;
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  getContext(): TContext;
  setContext(context: TContext): void;
}

export interface JsonConfig {
  parse?: ParseOptions;
  stringify?: StringifyOptions;
  plugins?: JsonPlugin[];
  onError?: (error: Error) => void;
}

export interface InferOptions {
  name?: string;
  export?: boolean;
  union?: boolean;
}

export interface Json5Options {
  indent?: number | string;
  quote?: '"' | "'";
  ascii?: boolean;
  space?: string;
}

export interface FlattenOptions {
  separator?: string;
  safe?: boolean;
}

export interface MergeOptions {
  deep?: boolean;
  arrayMerge?: 'replace' | 'concat' | 'merge';
}

export type PathSegment = string | number;

export interface EventEmitter {
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, data?: unknown): void;
}
