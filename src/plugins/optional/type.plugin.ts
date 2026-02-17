import type { JsonKernel, JsonPlugin, InferOptions } from '../../types';
import { isObject, isArray, isString, isNumber, isBoolean, isNull } from '../../utils';

interface TypeInfo {
  type: string;
  optional: boolean;
  children?: Record<string, TypeInfo>;
  items?: TypeInfo;
  union?: TypeInfo[];
}

function inferType(value: unknown): TypeInfo {
  if (isNull(value)) {
    return { type: 'null', optional: false };
  }

  if (isBoolean(value)) {
    return { type: 'boolean', optional: false };
  }

  if (isNumber(value)) {
    return { type: Number.isInteger(value) ? 'number' : 'number', optional: false };
  }

  if (isString(value)) {
    return { type: 'string', optional: false };
  }

  if (isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', optional: false, items: { type: 'never', optional: false } };
    }

    const itemTypes = value.map(inferType);
    const uniqueTypes = mergeTypes(itemTypes);
    
    return { type: 'array', optional: false, items: uniqueTypes };
  }

  if (isObject(value)) {
    const children: Record<string, TypeInfo> = {};
    
    for (const key of Object.keys(value)) {
      children[key] = inferType(value[key]);
    }
    
    return { type: 'object', optional: false, children };
  }

  return { type: 'unknown', optional: false };
}

function mergeTypes(types: TypeInfo[]): TypeInfo {
  if (types.length === 0) {
    return { type: 'never', optional: false };
  }

  if (types.length === 1) {
    return types[0]!;
  }

  const uniqueTypes: TypeInfo[] = [];
  const seen = new Set<string>();

  for (const t of types) {
    const key = JSON.stringify(t);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTypes.push(t);
    }
  }

  if (uniqueTypes.length === 1) {
    return uniqueTypes[0]!;
  }

  return { type: 'union', optional: false, union: uniqueTypes };
}

function typeToString(typeInfo: TypeInfo, name?: string, options?: InferOptions): string {
  const lines: string[] = [];
  
  if (name && options?.export) {
    lines.push(`export interface ${name} {`);
  } else if (name) {
    lines.push(`interface ${name} {`);
  }

  switch (typeInfo.type) {
    case 'null':
      return 'null';
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'unknown':
      return 'unknown';
    case 'never':
      return 'never';
    case 'array':
      if (typeInfo.items) {
        return `${typeToString(typeInfo.items, undefined, options)}[]`;
      }
      return 'unknown[]';
    case 'union':
      if (typeInfo.union) {
        return typeInfo.union.map(t => typeToString(t, undefined, options)).join(' | ');
      }
      return 'unknown';
    case 'object':
      if (typeInfo.children) {
        if (name) {
          const props = Object.entries(typeInfo.children).map(([key, value]) => {
            const optional = value.optional ? '?' : '';
            const type = typeToString(value, undefined, options);
            const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
            return `  ${keyStr}${optional}: ${type};`;
          });
          lines.push(...props);
          lines.push('}');
          return lines.join('\n');
        } else {
          const props = Object.entries(typeInfo.children).map(([key, value]) => {
            const optional = value.optional ? '?' : '';
            const type = typeToString(value, undefined, options);
            const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
            return `${keyStr}${optional}: ${type}`;
          });
          return `{ ${props.join('; ')} }`;
        }
      }
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

export function createTypePlugin(): JsonPlugin {
  return {
    name: 'type',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(typePlugin);
       *
       * // Infer TypeScript interface
       * json.infer({
       *   name: 'John',
       *   age: 30,
       *   address: {
       *     city: 'Istanbul',
       *     country: 'Turkey'
       *   }
       * });
       * // => interface Root {
       * // =>   name: string;
       * // =>   age: number;
       * // =>   address: {
       * // =>     city: string;
       * // =>     country: string;
       * // =>   };
       * // => }
       *
       * // With custom name and export
       * json.infer({ id: 1, name: 'Product' }, { name: 'Product', export: true });
       * // => export interface Product {
       * // =>   id: number;
       * // =>   name: string;
       * // => }
       * ```
       */
      kernel.register('infer', (data: unknown | unknown[], options?: InferOptions): string => {
        const name = options?.name ?? 'Root';

        const typeInfo = inferType(data);

        if (typeInfo.type === 'array' || typeInfo.type === 'object') {
          return typeToString(typeInfo, name, options);
        }

        return typeToString(typeInfo, name, options);
      }, 'type');
    },
  };
}

export const typePlugin = createTypePlugin();
