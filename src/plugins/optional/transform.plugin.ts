import type { JsonKernel, JsonPlugin, MergeOptions, FlattenOptions } from '../../types';
import { isObject, isArray } from '../../utils';

function deepMerge(
  target: unknown,
  source: unknown,
  options: MergeOptions = {}
): unknown {
  const { deep = true, arrayMerge = 'replace' } = options || {};

  if (!deep) {
    return { ...target as object, ...source as object };
  }

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  if (isArray(target) && isArray(source)) {
    switch (arrayMerge) {
      case 'concat':
        return [...target, ...source];
      case 'merge':
        const result = [...target];
        for (let i = 0; i < source.length; i++) {
          if (i < result.length) {
            result[i] = deepMerge(result[i], source[i], options);
          } else {
            result.push(source[i]);
          }
        }
        return result;
      case 'replace':
      default:
        return source;
    }
  }

  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (isObject(result[key]) && isObject(source[key])) {
      result[key] = deepMerge(result[key], source[key], options);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function flattenObject(
  obj: unknown,
  options: FlattenOptions = {}
): Record<string, unknown> {
  const { separator = '.', safe = false } = options || {};
  const result: Record<string, unknown> = {};

  function flatten(current: unknown, prefix: string = ''): void {
    if (isObject(current)) {
      for (const key of Object.keys(current)) {
        const newKey = prefix ? `${prefix}${separator}${key}` : key;
        if (safe && newKey.includes(separator)) {
          result[newKey.replace(/\./g, '\\.')] = current[key];
        } else {
          flatten(current[key], newKey);
        }
      }
    } else if (isArray(current)) {
      for (let i = 0; i < current.length; i++) {
        const newKey = prefix ? `${prefix}[${i}]` : `[${i}]`;
        flatten(current[i], newKey);
      }
    } else {
      result[prefix] = current;
    }
  }

  flatten(obj);
  return result;
}

function unflattenObject(
  obj: Record<string, unknown>,
  separator: string = '.'
): unknown {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const parts = key.split(separator);
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part && !(part in current)) {
        current[part] = {};
      }
      if (part) {
        current = current[part] as Record<string, unknown>;
      }
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      current[lastPart] = obj[key];
    }
  }

  return result;
}

function pickKeys(obj: unknown, keys: string[] | string): unknown {
  if (!isObject(obj)) return obj;

  const keysArray = Array.isArray(keys) ? keys : [keys];

  const result: Record<string, unknown> = {};
  for (const key of keysArray) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

function omitKeys(obj: unknown, keys: string[] | string): unknown {
  if (!isObject(obj)) return obj;

  const keysArray = Array.isArray(keys) ? keys : [keys];

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (!keysArray.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

function sortObjectKeys(obj: unknown): unknown {
  if (isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  if (isObject(obj)) {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = sortObjectKeys(obj[key]);
    }
    return sorted;
  }

  return obj;
}

function mapObjectValues(
  obj: unknown,
  fn: (value: unknown, key: string) => unknown
): unknown {
  if (isArray(obj)) {
    return obj.map((item) => mapObjectValues(item, fn));
  }

  if (isObject(obj)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = mapObjectValues(obj[key], fn);
    }
    return result;
  }

  return fn(obj, '');
}

function filterObjectValues(
  obj: unknown,
  fn: (value: unknown, key: string) => boolean
): unknown {
  if (isArray(obj)) {
    return obj
      .filter((item) => filterObjectValues(item, fn) !== undefined)
      .map((item) => filterObjectValues(item, fn))
      .filter((v) => v !== undefined);
  }

  if (isObject(obj)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const filtered = filterObjectValues(obj[key], fn);
      if (filtered !== undefined) {
        result[key] = filtered;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  return fn(obj, '') ? obj : undefined;
}

export function createTransformPlugin(): JsonPlugin {
  return {
    name: 'transform',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * // Simple merge
       * json.merge({ a: 1 }, { b: 2 });
       * // => { a: 1, b: 2 }
       *
       * // Deep merge
       * json.merge({ user: { name: 'John' } }, { user: { age: 30 } }, { deep: true });
       * // => { user: { name: 'John', age: 30 } }
       *
       * // Array merge with concat
       * json.merge({ items: [1] }, { items: [2] }, { arrayMerge: 'concat' });
       * // => { items: [1, 2] }
       * ```
       */
      kernel.register('merge', (...args: unknown[]): unknown => {
        const options = args[args.length - 1] as MergeOptions;
        const objects = (isObject(options) && !isArray(options) && 
          ('deep' in options || 'arrayMerge' in options))
          ? args.slice(0, -1)
          : args;
        
        let result: unknown = {};
        for (const obj of objects) {
          result = deepMerge(result, obj, options);
        }
        return result;
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * json.flatten({ user: { name: 'John', age: 30 } });
       * // => { 'user.name': 'John', 'user.age': 30 }
       *
       * // Custom separator
       * json.flatten({ a: { b: { c: 1 } } }, { separator: '_' });
       * // => { 'a_b_c': 1 }
       * ```
       */
      kernel.register('flatten', (obj: unknown, options?: FlattenOptions): Record<string, unknown> => {
        return flattenObject(obj, options);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * json.unflatten({ 'user.name': 'John', 'user.age': 30 });
       * // => { user: { name: 'John', age: 30 } }
       *
       * // Custom separator
       * json.unflatten({ 'a_b_c': 1 }, '_');
       * // => { a: { b: { c: 1 } } }
       * ```
       */
      kernel.register('unflatten', (obj: Record<string, unknown>, separator?: string): unknown => {
        return unflattenObject(obj, separator);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * // Pick multiple keys
       * json.pick({ name: 'John', age: 30, email: 'john@example.com' }, ['name', 'email']);
       * // => { name: 'John', email: 'john@example.com' }
       *
       * // Pick single key
       * json.pick({ name: 'John', age: 30 }, 'name');
       * // => { name: 'John' }
       * ```
       */
      kernel.register('pick', (obj: unknown, keys: string[] | string): unknown => {
        return pickKeys(obj, keys);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * // Omit multiple keys
       * json.omit({ name: 'John', age: 30, password: 'secret' }, ['password']);
       * // => { name: 'John', age: 30 }
       *
       * // Omit single key
       * json.omit({ name: 'John', age: 30, password: 'secret' }, 'password');
       * // => { name: 'John', age: 30 }
       * ```
       */
      kernel.register('omit', (obj: unknown, keys: string[] | string): unknown => {
        return omitKeys(obj, keys);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * json.sortKeys({ z: 1, a: 2, m: 3 });
       * // => { a: 2, m: 3, z: 1 }
       *
       * // Nested objects are also sorted
       * json.stringify(json.sortKeys({ b: { z: 1, a: 2 } }));
       * // => '{"b":{"a":2,"z":1}}'
       * ```
       */
      kernel.register('sortKeys', (obj: unknown): unknown => {
        return sortObjectKeys(obj);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * // Double all numbers
       * json.mapValues({ a: 1, b: 2, c: 3 }, (v) => typeof v === 'number' ? v * 2 : v);
       * // => { a: 2, b: 4, c: 6 }
       *
       * // Transform strings
       * json.mapValues({ name: 'john' }, (v) => typeof v === 'string' ? v.toUpperCase() : v);
       * // => { name: 'JOHN' }
       * ```
       */
      kernel.register('mapValues', (obj: unknown, fn: (value: unknown, key: string) => unknown): unknown => {
        return mapObjectValues(obj, fn);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(transformPlugin);
       *
       * // Filter by value type
       * json.filterValues({ a: 1, b: 'text', c: 2 }, (v) => typeof v === 'number');
       * // => { a: 1, c: 2 }
       *
       * // Filter by key name
       * json.filterValues({ foo: 1, bar: 2, baz: 3 }, (v, k) => k.startsWith('b'));
       * // => { bar: 2, baz: 3 }
       * ```
       */
      kernel.register('filterValues', (obj: unknown, fn: (value: unknown, key: string) => boolean): unknown => {
        return filterObjectValues(obj, fn);
      });
    },
  };
}

export const transformPlugin = createTransformPlugin();
